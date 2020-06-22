import fs from 'fs-extra'
import path from 'path'
import { AESCipher, createRandomIv, createRandomKey } from './aes-cipher'
import { destroyBuffer } from './buffer'
import { WorkspaceCatalog, WorkspaceCatalogData } from './catalog'
import { ERROR_CODE } from './error'
import * as io from './io'
import { logger } from './logger'


interface CipherMasterParams {
  /**
   *
   */
  workspaceDir: string
  /**
   * Whether to print asterisks when entering a password
   */
  showAsterisk: boolean
  /**
   * The storage file of the secret for encrypt/decrypt workspaces
   */
  secretFilepath: string
  /**
   * Minimum length of password
   */
  miniumPasswordLength: number
}


export class CipherMaster {
  protected readonly workspaceDir: string
  protected readonly showAsterisk: boolean
  protected readonly secretFilepath: string
  protected readonly minimumPasswordLength: number
  protected readonly volatilePassword: Buffer | null

  public constructor(params: CipherMasterParams) {
    this.workspaceDir = params.workspaceDir
    this.showAsterisk = params.showAsterisk
    this.secretFilepath = params.secretFilepath
    this.minimumPasswordLength = params.miniumPasswordLength
    this.volatilePassword = null
  }

  /**
   * Read password from terminal
   */
  public async inputPassword(
  ): Promise<Buffer | never> {
    const self = this
    const password: Buffer = await io.inputPassword(
      self.showAsterisk, self.minimumPasswordLength)
    return password
  }

  /**
   * encrypt files matched specified glob patterns
   * @param plainFilepaths
   * @param outputRelativePath
   * @param resolveDestPath     calc the output path of the encrypted content
   */
  public async encryptFiles(
    plainFilepaths: string[],
    outputRelativePath: string,
    resolveDestPath: (plainFilepath: string) => string,
  ): Promise<void> {
    const self = this
    const [iv, key] = await self.loadSecret()
    const aesCipher = new AESCipher({ iv, key })

    try {
      if (plainFilepaths.length > 0) {
        const tasks: Promise<void>[] = []
        for (const plainFilepath of plainFilepaths) {
          const cipherFilepath = path.join(outputRelativePath, resolveDestPath(plainFilepath))
          logger.verbose(`encrypting (${ plainFilepath }) --> (${ cipherFilepath })`)

          const task = aesCipher.encryptFile(
            path.resolve(self.workspaceDir, plainFilepath),
            path.resolve(self.workspaceDir, cipherFilepath))
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
   * @param cipherFilepaths
   * @param outputRelativePath
   * @param resolveDestPath     calc the output path of the decrypted content
   */
  public async decryptFiles(
    cipherFilepaths: string[],
    outputRelativePath: string,
    resolveDestPath: (cipherFilepath: string) => string,
  ): Promise<void> {
    const self = this
    const [iv, key] = await self.loadSecret()
    const aesCipher = new AESCipher({ iv, key })

    try {
      const tasks: Promise<void>[] = []
      if (cipherFilepaths.length > 0) {
        for (const cipherFilepath of cipherFilepaths) {
          const plainFilepath = path.join(outputRelativePath, resolveDestPath(cipherFilepath))
          logger.verbose(`decrypting (${ cipherFilepath }) --> (${ plainFilepath })`)

          const task = aesCipher.decryptFile(
            path.resolve(self.workspaceDir, cipherFilepath),
            path.resolve(self.workspaceDir, plainFilepath))
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
   */
  public async loadSecret(): Promise<[Buffer, Buffer]> {
    const self = this
    if (!fs.existsSync(self.secretFilepath)) {
      throw new Error(`cannot find secret file (${ self.secretFilepath })`)
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
      const content: Buffer = await fs.readFile(self.secretFilepath)
      const aesCipher = new AESCipher({ iv: originalIv, key: originalKey })
      plainData = aesCipher.decrypt(content)
      iv = Buffer.alloc(32)
      key = Buffer.alloc(32)
      plainData.copy(iv, 0, 0, 32)
      plainData.copy(key, 0, 32, 64)
    } finally {
      destroyBuffer(originalIv)
      destroyBuffer(originalKey)
      destroyBuffer(plainData)
    }
    return [iv, key]
  }

  /**
   * create AES iv/key and stored in encrypted secret file
   */
  public async createSecret(): Promise<void> {
    const self = this

    let password: Buffer | null = null
    let originalIv: Buffer | null, originalKey: Buffer | null
    try {
      password = await self.inputPassword()
      const confirmed = await io.confirmPassword(
        password, self.showAsterisk, self.minimumPasswordLength)
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
      await fs.writeFile(self.secretFilepath, cipherSecret)
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
   * @param cipherFilePatterns
   * @param resolveDestPath
   */
  public async changeSecret(
    cipherFilePatterns: string[],
    resolveDestPath: (cipherFilepath: string) => string,
  ): Promise<void> {
    const self = this
    if (!fs.existsSync(self.secretFilepath)) {
      throw new Error(`cannot find secret file (${ self.secretFilepath })`)
    }

    // waiting for ciphered data with old secret to be decrypted
    if (cipherFilePatterns.length > 0) {
      await self.decryptFiles(cipherFilePatterns, `__source__${ Date.now() }`, resolveDestPath)
    }

    // generate new secret
    await self.createSecret()
  }

  /**
   *
   */
  public async loadIndex(
    indexFilepath: string,
    cipherRelativeDir: string,
  ): Promise<WorkspaceCatalog | null> {
    if (!fs.existsSync(indexFilepath)) return null

    const self = this
    let result: WorkspaceCatalog | null = null
    let iv: Buffer | null = null, key: Buffer | null = null
    try {
      const cipherData: Buffer = await fs.readFile(indexFilepath)
      ; ([iv, key] = await self.loadSecret())
      const aesCipher = new AESCipher({ iv, key })
      const plainData: Buffer = aesCipher.decrypt(cipherData)
      const plainContent = plainData.toString('utf-8')
      const data: WorkspaceCatalogData = JSON.parse(plainContent)
      result = new WorkspaceCatalog({ ...data, cipherRelativeDir })
    } finally {
      destroyBuffer(iv)
      destroyBuffer(key)
    }
    return result
  }

  public async saveIndex(
    indexFilepath: string,
    catalog: WorkspaceCatalog,
  ): Promise<void> {
    const self = this
    let iv: Buffer | null = null, key: Buffer | null = null
    try {
      const data: WorkspaceCatalogData = catalog.toData()
      const plainContent: Buffer = Buffer.from(JSON.stringify(data), 'utf-8')
      ; ([iv, key] = await self.loadSecret())
      const aesCipher = new AESCipher({ iv, key })
      const cipherData = aesCipher.encrypt(plainContent)
      await fs.writeFile(indexFilepath, cipherData)
    } finally {
      destroyBuffer(iv)
      destroyBuffer(key)
    }
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
