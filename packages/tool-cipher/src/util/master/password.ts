import crypto from 'crypto'
import fs from 'fs-extra'
import { AESCipher, createRandomIv, createRandomKey } from '../aes-cipher'
import { destroyBuffer, destroyBuffers } from '../buffer'
import { ERROR_CODE } from '../error'
import * as io from '../io'


export interface PasswordMasterParams {
  /**
   * Whether to print asterisks when entering a password
   */
  showAsterisk: boolean
  /**
   * Minimum length of password
   */
  miniumPasswordLength: number
  /**
   * The storage file of the secret for encrypt/decrypt workspaces
   */
  secretFilepath: string
}


export class PasswordMaster {
  protected readonly ivSize = 32
  protected readonly keySize = 32
  protected readonly showAsterisk: boolean
  protected readonly minimumPasswordLength: number
  protected readonly secretFilepath: string
  protected readonly _secretStayTime: number = 12 * 1000  // 12s
  protected _volatileSecret: [Buffer, Buffer] | null = null
  protected _timeout: NodeJS.Timeout | null = null

  public constructor(params: PasswordMasterParams) {
    this.showAsterisk = params.showAsterisk
    this.minimumPasswordLength = params.miniumPasswordLength
    this.secretFilepath = params.secretFilepath
  }

  public async inputPassword(question = 'Password: '): Promise<Buffer> {
    const self = this
    const password: Buffer = await io.inputPassword(
      self.showAsterisk, self.minimumPasswordLength, question)

    const sha1 = crypto.createHash('sha1')
    sha1.update(password)
    const hashedPassword = sha1.digest()
    destroyBuffer(password)

    return hashedPassword
  }

  public async createSecret(): Promise<void> {
    const self = this
    let secret: Buffer | null = null
    try {
      secret = await self.createAESPassword()
      await fs.writeFile(self.secretFilepath, secret)
    } finally {
      destroyBuffer(secret)
    }
  }

  public async loadSecret(): Promise<[Buffer, Buffer]> {
    const self = this

    const timingRefreshSecret = () => {
      if (self._timeout != null)  {
        clearTimeout(self._timeout)
      }
      self._timeout = setTimeout(() => {
        destroyBuffers(self._volatileSecret)
        self._volatileSecret = null
        self._timeout = null
      }, self._secretStayTime)
    }

    if (self._volatileSecret != null) {
      const [_iv, _key] = self._volatileSecret
      const iv = Buffer.alloc(_iv.length)
      const key = Buffer.alloc(_key.length)
      _iv.copy(iv, 0, 0, _iv.length)
      _key.copy(key, 0, 0, _key.length)
      timingRefreshSecret()
      return [iv, key]
    }

    if (!fs.existsSync(self.secretFilepath)) {
      throw new Error(`cannot find secret file (${ self.secretFilepath })`)
    }

    let secret: [Buffer, Buffer] | null = null
    for (let i = 0, maxRetryTimes = 3; i < maxRetryTimes; ++i) {
      const encryptedAesPassword: Buffer = await fs.readFile(self.secretFilepath)
      const question = i > 0 ? '(Retry) Password: ' : 'Password: '
      secret = await self.loadAESPassword(encryptedAesPassword, question)
      if (secret != null) break
    }

    if (secret == null) {
      throw {
        code: ERROR_CODE.WRONG_PASSWORD,
        message: 'Password incorrect'
      }
    }

    timingRefreshSecret()
    return secret
  }

  protected async createAESPassword(): Promise<Buffer> {
    const self = this

    const iv: Buffer = createRandomIv(self.ivSize)
    const key: Buffer = createRandomKey(self.keySize)
    const mac: Buffer = self.calcMac(iv, key)
    const aesPassword: Buffer = Buffer.alloc(iv.length + key.length + mac.length)

    {
      let s = 0
      iv.copy(aesPassword, s, 0, iv.length)
      destroyBuffer(iv)

      s += iv.length
      key.copy(aesPassword, s, 0, key.length)
      destroyBuffer(key)

      s += key.length
      mac.copy(aesPassword, s, 0, mac.length)
      destroyBuffer(mac)
    }

    // encrypt aes-password
    let mainPassword: Buffer | null = null
    let originalIv: Buffer | null = null
    let originalKey: Buffer | null = null
    try {
      mainPassword = await self.inputPassword()
      ~([originalIv, originalKey] = self.calcIvAndKeyFromPassword(mainPassword))
    } finally {
      destroyBuffer(mainPassword)
      if (originalIv == null || originalKey == null) {
        destroyBuffer(originalIv)
        destroyBuffer(originalKey)
        throw new Error('[loadSecret] unknown error: originalIv/originalKey is null')
      }
    }

    let encryptedAESPassword: Buffer
    try {
      const aesCipher = new AESCipher({ iv: originalIv, key: originalKey })
      encryptedAESPassword = aesCipher.encrypt(aesPassword)
    } finally {
      destroyBuffer(originalIv)
      destroyBuffer(originalKey)
      destroyBuffer(aesPassword)
    }
    return encryptedAESPassword
  }

  /**
   *
   */
  protected async loadAESPassword(
    encryptedAesPassword: Buffer,
    question?: string,
  ): Promise<[Buffer, Buffer] | null> {
    const self = this

    // decrypt aes-password
    let mainPassword: Buffer | null = null
    let originalIv: Buffer | null = null
    let originalKey: Buffer | null = null
    try {
      mainPassword = await self.inputPassword(question)
      ~([originalIv, originalKey] = self.calcIvAndKeyFromPassword(mainPassword))
    } finally {
      destroyBuffer(mainPassword)
      if (originalIv == null || originalKey == null) {
        destroyBuffer(originalIv)
        destroyBuffer(originalKey)
        throw new Error('[loadSecret] unknown error: originalIv/originalKey is null')
      }
    }

    let decryptedAESPassword: Buffer | null = null
    const iv: Buffer = Buffer.alloc(self.ivSize)
    const key: Buffer = Buffer.alloc(self.keySize)
    let mac: Buffer | null = null
    try {
      const aesCipher = new AESCipher({ iv: originalIv, key: originalKey })
      decryptedAESPassword = aesCipher.decrypt(encryptedAesPassword)

      mac = Buffer.alloc(decryptedAESPassword.length - self.ivSize - self.keySize)
      decryptedAESPassword.copy(iv, 0, 0, self.ivSize)
      decryptedAESPassword.copy(key, 0, self.ivSize, self.ivSize + self.keySize)
      decryptedAESPassword.copy(mac, 0, self.ivSize + self.keySize, decryptedAESPassword.length)
    } finally {
      destroyBuffer(originalIv)
      destroyBuffer(originalKey)
      destroyBuffer(decryptedAESPassword)
    }

    const realMac = self.calcMac(iv, key)
    if (mac.compare(realMac) !== 0) return null
    return [iv, key]
  }

  /**
   * calc Message Authentication Code
   * @param pieces
   */
  protected calcMac(...pieces: Buffer[]): Buffer {
    const sha1 = crypto.createHash('sha1')
    for (const piece of pieces) {
      sha1.update(piece)
    }
    const mac: Buffer = sha1.digest()
    return mac
  }

  /**
   * @param password  main password
   * @returns [iv, key] to encrypt/decrypt secret file
   */
  protected calcIvAndKeyFromPassword(password: Buffer): [Buffer, Buffer] {
    const iv: Buffer = Buffer.alloc(32)
    const key: Buffer = Buffer.alloc(32)
    let j = 0

    // generate iv
    for (let i = 0; i < 32; ++i) {
      iv[i] = password[j]
      j = (j + 1) % password.length
    }

    // generate key
    for (let i = 0; i < 32; ++i) {
      key[i] = password[j]
      j = (j + 1) % password.length
    }

    return [iv, key]
  }
}
