import fs from 'fs-extra'
import { coverBoolean, coverNumber, coverString } from '@barusu/util-option'
import { calcMac, destroyBuffer } from './buffer'
import { Cipher } from './cipher'
import { ErrorCode } from './error'
import { EventTypes, eventBus } from './event-bus'
import * as io from './io'


/**
 * Params for SecretMaster.constructor
 */
export interface SecretMasterParams {
  /**
   * Cipher built with main password to encrypt / decrypt secret
   */
  cipher: Cipher
  /**
   * Filepath to store secret
   */
  secretFilepath: string
  /**
   * Encoding of secret file
   * @default 'utf-8'
   */
  secretFileEncoding?: string
  /**
   * Encoding of secret content
   * @default 'hex'
   */
  secretContentEncoding?: BufferEncoding
  /**
   * max wrong password retry times
   * @default 3
   */
  maxRetryTimes?: number
  /**
   * Whether to print asterisks when entering a password
   * @default true
   */
  showAsterisk?: boolean
  /**
   * Minimum length of password
   * @default 6
   */
  minimumSize?: number
  /**
   * Maximum length of password
   * @default 100
   */
  maximumSize?: number
}


export class SecretMaster {
  protected readonly cipher: Cipher
  protected readonly secretFilepath: string
  protected readonly secretFileEncoding: string
  protected readonly secretContentEncoding: BufferEncoding
  protected readonly maxRetryTimes: number
  protected readonly showAsterisk: boolean
  protected readonly minimumSize: number
  protected readonly maximumSize: number
  protected secret: Buffer | null = null
  protected cleanupTimer: number | null = null
  protected cleanupTimeout: number = 12 * 1000  // 12s

  public constructor(params: SecretMasterParams) {
    this.cipher = params.cipher
    this.secretFilepath = params.secretFilepath
    this.secretFileEncoding = coverString('utf-8', params.secretFileEncoding)
    this.secretContentEncoding = coverString('hex', params.secretContentEncoding) as BufferEncoding
    this.maxRetryTimes = coverNumber(3, params.maxRetryTimes)
    this.showAsterisk = coverBoolean(true, params.showAsterisk)
    this.minimumSize = coverNumber(6, params.minimumSize)
    this.maximumSize = coverNumber(100, params.maximumSize)
    eventBus.on(EventTypes.EXITING, () => this.cleanup())
  }

  public initCipherFromPassword(password: Buffer): void {
    this.cipher.initKeyFromPassword(password)
  }

  /**
   * Load key from secret
   */
  public async loadSecret(): Promise<Buffer> {
    const self = this
    if (!fs.existsSync(self.secretFilepath)) {
      throw new Error(`cannot find secret file (${ self.secretFilepath })`)
    }

    const bakSecret = (): Buffer => {
      const secret: Buffer = Buffer.alloc(self.secret!.length)
      self.secret!.copy(secret, 0, 0, self.secret!.length)
      self.setCleanupTimer()
      return secret
    }

    // existed secret
    if (self.secret != null) {
      return bakSecret()
    }

    const secretContent: string = await fs.readFile(
      self.secretFilepath, self.secretFileEncoding)
    const secretSepIndex = secretContent.indexOf('.')
    const cipherSecret: Buffer = Buffer.from(
      secretContent.slice(0, secretSepIndex), self.secretContentEncoding)
    const cipherSecretMac: Buffer = Buffer.from(
      secretContent.slice(secretSepIndex + 1), self.secretContentEncoding)

    const testPassword = (password: Buffer): boolean => {
      self.cipher.initKeyFromPassword(password)

      let plainSecret: Buffer | null = null
      let plainSecretMac: Buffer | null = null
      let mac: Buffer | null = null
      let flag = false
      try {
        plainSecret = self.cipher.decrypt(cipherSecret)
        plainSecretMac = self.cipher.decrypt(cipherSecretMac)
        mac = calcMac(plainSecret)
        if (mac.compare(plainSecretMac) === 0) {
          flag = true
        }
      } finally {
        destroyBuffer(plainSecret)
        destroyBuffer(plainSecretMac)
        destroyBuffer(mac)
        self.cleanup()
      }
      return flag
    }

    let secret: Buffer | null = null
    for (let i = 0; i < self.maxRetryTimes; ++i) {
      let password: Buffer | null = null
      const question = i > 0 ? '(Retry) Password: ' : 'Password: '
      password = await self.inputPassword(question, testPassword)
      if (password != null) {
        try {
          self.cipher.initKeyFromPassword(password)
          secret = self.cipher.decrypt(cipherSecret)
        } finally {
          destroyBuffer(password)
        }
        break
      }
    }

    if (secret == null) {
      throw {
        code: ErrorCode.WRONG_PASSWORD,
        message: 'Password incorrect'
      }
    }

    self.secret = secret
    return bakSecret()
  }

  /**
   * Generate secret from key
   */
  public async saveSecret(secret: Buffer | null = this.secret): Promise<void> {
    const {
      secretFileEncoding,
      secretContentEncoding,
      secretFilepath,
    } = this

    if (secret == null) {
      throw {
        code: ErrorCode.NULL_POINTER_ERROR,
        message: '[saveSecret] secret is null',
      }
    }

    const secretMac: Buffer = calcMac(secret)
    const cipherSecret = this.cipher.encrypt(secret)
    const cipherSecretMac = this.cipher.encrypt(secretMac)
    const secretContent = cipherSecret.toString(secretContentEncoding) +
      '.' + cipherSecretMac.toString(secretContentEncoding)
    await fs.writeFile(secretFilepath, secretContent, secretFileEncoding)

    this.cleanup()
    this.secret = secret
    this.loadSecret()
  }

  /**
   * Destroy secret and sensitive data
   */
  public cleanup(): void {
    destroyBuffer(this.secret)
    this.secret = null
    this.cipher.cleanup()
  }

  /**
   * set a timer to do the cleanup
   */
  protected setCleanupTimer(): void {
    if (this.cleanupTimer != null) {
      clearTimeout(this.cleanupTimer)
    }
    this.cleanupTimer = setTimeout(
      () => this.cleanup(),
      this.cleanupTimeout
    ) as any
  }

  protected async inputPassword(
    question: string,
    testPassword: (password: Buffer) => boolean,
  ): Promise<Buffer | null> {
    const self = this

    let password: Buffer | null = null
    for (let i = 0; i < self.maxRetryTimes; ++i) {
      password = await io.inputPassword(
        question, self.showAsterisk, 1, self.minimumSize, self.maximumSize)
      if (testPassword(password)) break
      destroyBuffer(password)
      password = null
    }
    return password
  }
}
