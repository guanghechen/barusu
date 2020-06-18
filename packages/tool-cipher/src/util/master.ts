import fs from 'fs-extra'
import globby from 'globby'
import path from 'path'
import { AESCipher, createRandomIv, createRandomKey } from './aes-cipher'
import { destroyBuffer } from './buffer'
import { CustomError, ERROR_CODE } from './error'
import * as io from './io'


interface CipherMasterParams {
  /**
   * Whether to print asterisks when entering a password
   */
  showAsterisk: boolean
}


export class CipherMaster {
  protected readonly showAsterisk: boolean

  public constructor(params: CipherMasterParams) {
    this.showAsterisk = params.showAsterisk
  }

  /**
   * Read password from terminal
   */
  public async inputPassword(
    question = 'Password: ',
  ): Promise<Buffer | never> {
    const self = this

    let hint: string
    const isValidPassword = (password: Buffer): boolean => {
      if (password.length < 16) {
        hint = 'At least 16 ascii non-space characters needed'
        return false
      }
      if (password.length > 100) {
        hint = 'It\'s too long, do not exceed 100 characters'
        return false
      }
      return true
    }

    const isValidCharacter = (c: number): boolean => {
      // ignore control characters or invalid ascii characters
      if (c <= 0x20 || c >= 0x7F) return false

      // ignore slash and backslash
      if (c === 0x2f || c === 0x5c) return false

      // others are valid
      return true
    }

    const password: Buffer | null = await io.input(
      'Master Password: ',
      isValidPassword,
      isValidCharacter,
      () => hint,
      3,
      self.showAsterisk,
    )

    if (password == null) {
      const error: CustomError = {
        code: ERROR_CODE.BAD_PASSWORD,
        message: `too many times failed to get answer of '${ question.replace(/^[\s:]*([\s\S]+?)[\s:]*$/, '$1') }'`,
      }
      throw error
    }

    return password
  }

  public async confirmPassword(
    password: Buffer,
    question = 'Repeat Password: ',
  ): Promise<boolean | never> {
    const self = this
    const repeatedPassword: Buffer = await self.inputPassword(question)

    const isSame = (): boolean => {
      if (repeatedPassword.length !== password.length) return false
      for (let i = 0; i < password.length; ++i) {
        if (password[i] !== repeatedPassword[i]) return false
      }
      return true
    }

    const result = isSame()
    destroyBuffer(repeatedPassword)
    return result
  }

  /**
   * encrypt files matched specified glob patterns
   * @param secretFilepath      filepath of secret of the encryption algorithm
   * @param plainFilePatterns   glob patterns to match files to be encrypted
   * @param resolveDestPath     calc the output path of the encrypted content
   */
  public async encryptFiles(
    secretFilepath: string,
    plainFilePatterns: string[],
    resolveDestPath: (plainFilepath: string) => string,
  ): Promise<void> {
    const self = this
    const [iv, key] = await self.loadSecret(secretFilepath)
    const aesCipher = new AESCipher({ iv, key })

    try {
      const tasks: Promise<void>[] = []
      if (plainFilePatterns.length > 0) {
        const paths = await globby(plainFilePatterns)
        for (const plainFilepath of paths) {
          const cipherFilepath = resolveDestPath(plainFilepath)
          const task = aesCipher.encryptFile(plainFilepath, cipherFilepath)
          tasks.push(task)
        }
        await Promise.all(tasks)
      }
    } finally {
      destroyBuffer(iv)
      destroyBuffer(key)
    }
  }

  /**
   * decrypt files matched specified glob patterns
   * @param secretFilepath      filepath of secret of the decryption algorithm
   * @param cipherFilePatterns  glob patterns to match files to be decrypted
   * @param resolveDestPath     calc the output path of the decrypted content
   */
  public async decryptFiles(
    secretFilepath: string,
    cipherFilePatterns: string[],
    resolveDestPath: (cipherFilepath: string) => string,
  ): Promise<void> {
    const self = this
    const [iv, key] = await self.loadSecret(secretFilepath)
    const aesCipher = new AESCipher({ iv, key })

    try {
      const tasks: Promise<void>[] = []
      if (cipherFilePatterns.length > 0) {
        const paths = await globby(cipherFilePatterns)
        for (const cipherFilepath of paths) {
          const plainFilepath = resolveDestPath(cipherFilepath)
          const task = aesCipher.decryptFile(cipherFilepath, plainFilepath)
          tasks.push(task)
        }
        await Promise.all(tasks)
      }
    } finally {
      destroyBuffer(iv)
      destroyBuffer(key)
    }
  }

  /**
   * load AES iv/key from encrypted secret file
   * @param secretFilepath      filepath of secret of the encryption/decryption algorithm
   */
  public async loadSecret(secretFilepath: string): Promise<[Buffer, Buffer]> {
    const self = this
    if (!fs.existsSync(secretFilepath)) {
      throw new Error(`cannot find secret file (${ secretFilepath })`)
    }

    let password: Buffer | null = null
    let originalIv: Buffer | null, originalKey: Buffer | null
    try {
      password = await self.inputPassword()
      ; ([originalIv, originalKey] = self.calcIvAndKeyFromPassword(password))
    } finally {
      destroyBuffer(password)
    }

    if (originalIv == null || originalKey == null) {
      destroyBuffer(originalIv)
      destroyBuffer(originalKey)
      throw new Error('[loadSecret] unknown error: originalIv/originalKey is null')
    }

    let iv: Buffer, key: Buffer, plainData: Buffer | null = null
    try {
      const content: Buffer = await fs.readFile(secretFilepath)
      const aesCipher = new AESCipher({ iv: originalIv, key: originalKey })
      plainData = aesCipher.decrypt(content)
      iv = plainData.slice(0, 32)
      key = plainData.slice(32, 64)
    } finally {
      destroyBuffer(originalIv)
      destroyBuffer(originalKey)
      destroyBuffer(plainData)
    }
    return [iv, key]
  }

  /**
   * create AES iv/key and stored in encrypted secret file
   * @param secretFilepath        the storage file of the secret to be generated
   */
  public async createSecret(secretFilepath: string): Promise<void> {
    const self = this

    let password: Buffer | null = null
    let originalIv: Buffer | null, originalKey: Buffer | null
    try {
      password = await self.inputPassword()
      const confirmed = await self.confirmPassword(password)
      if (!confirmed) {
        throw {
          code: ERROR_CODE.ENTERED_PASSWORD_DIFFER,
          message: 'Entered passwords differ',
        }
      }
      ; ([originalIv, originalKey] = self.calcIvAndKeyFromPassword(password))
    } finally {
      destroyBuffer(password)
    }

    if (originalIv == null || originalKey == null) {
      destroyBuffer(originalIv)
      destroyBuffer(originalKey)
      throw new Error('[generateSecretFile] unknown error: originalIv/originalKey is null')
    }

    const iv = createRandomIv()
    const key = createRandomKey()
    let plainSecret: Buffer | null = null
    let cipherSecret: Buffer | null = null
    try {
      const aesCipher = new AESCipher({ iv: originalIv, key: originalKey })
      plainSecret = Buffer.concat([iv, key])
      cipherSecret = aesCipher.encrypt(plainSecret)

      // mkdir dir if the ancient directories are not exists
      if (!fs.existsSync(path.dirname(secretFilepath))) {
        fs.mkdirpSync(path.dirname(secretFilepath))
      }
      await fs.writeFile(secretFilepath, cipherSecret)
    } finally {
      destroyBuffer(originalIv)
      destroyBuffer(originalKey)
      destroyBuffer(iv)
      destroyBuffer(key)
      destroyBuffer(plainSecret)
      destroyBuffer(cipherSecret)
    }
  }

  /**
   * Change the secret.
   * Prior to this, the encrypted content will be decrypted using the old key,
   * and then the new key will be written to the key file.
   * @param secretFilepath        the storage file of the secret to be generated
   * @param cipherFilePatterns
   * @param resolveDestPath
   */
  public async changeSecret(
    secretFilepath: string,
    cipherFilePatterns: string[],
    resolveDestPath: (cipherFilepath: string) => string,
  ): Promise<void> {
    const self = this
    if (!fs.existsSync(secretFilepath)) {
      throw new Error(`cannot find secret file (${ secretFilepath })`)
    }

    // waiting for ciphered data with old secret to be decrypted
    if (cipherFilePatterns.length > 0) {
      await self.decryptFiles(secretFilepath, cipherFilePatterns, resolveDestPath)
    }

    // generate new secret
    await self.createSecret(secretFilepath)
  }

  /**
   * @param password  main password
   * @returns [iv, key] to encrypt/decrypt secret file
   */
  protected calcIvAndKeyFromPassword (password: Buffer): [Buffer, Buffer] {
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
