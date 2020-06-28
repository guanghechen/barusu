import fs from 'fs-extra'
import path from 'path'
import progress from 'cli-progress'
import { coverBoolean, coverNumber, coverString } from '@barusu/option-util'
import { destroyBuffer } from './buffer'
import { WorkspaceCatalog, WorkspaceCatalogData } from './catalog'
import { AESCipher, Cipher } from './cipher'
import { ErrorCode } from './error'
import * as io from './io'
import { confirmPassword } from './io'
import { logger } from './logger'
import { SecretMaster } from './secret'


export interface CipherMasterParams {
  /**
   *
   */
  workspaceDir: string
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


export class CipherMaster {
  protected readonly workspaceDir: string
  protected readonly secretFilepath: string
  protected readonly secretFileEncoding: string
  protected readonly cipher: Cipher
  protected readonly secretMaster: SecretMaster
  protected readonly showAsterisk: boolean
  protected readonly minimumSize: number
  protected readonly maximumSize: number

  public constructor(params: CipherMasterParams) {
    const secretFileEncoding = coverString('utf-8', params.secretFileEncoding)
    const showAsterisk = coverBoolean(true, params.showAsterisk)
    const minimumSize = coverNumber(6, params.minimumSize)
    const maximumSize = coverNumber(100, params.maximumSize)

    this.secretFileEncoding = secretFileEncoding
    this.showAsterisk = showAsterisk
    this.minimumSize = minimumSize
    this.maximumSize = maximumSize
    this.workspaceDir = params.workspaceDir
    this.secretFilepath = params.secretFilepath
    this.cipher = new AESCipher()
    this.secretMaster = new SecretMaster({
      cipher: new AESCipher(),
      secretFilepath: params.secretFilepath,
      secretFileEncoding,
      secretContentEncoding: params.secretContentEncoding,
      maxRetryTimes: params.maxRetryTimes,
      showAsterisk,
      minimumSize,
      maximumSize,
    })
  }

  public async loadSecret(): Promise<void> {
    const secret: Buffer = await this.secretMaster.loadSecret()
    this.cipher.initKeyFromSecret(secret)
  }

  public async createSecret(): Promise<void> {
    const { cipher, secretMaster, showAsterisk, minimumSize, maximumSize } = this
    const secret: Buffer = cipher.createSecret()

    let password: Buffer | null = null
    try {
      password = await io.inputPassword('Password: ', showAsterisk, 3, minimumSize, maximumSize)
      const isSame = await confirmPassword(password, undefined, showAsterisk, minimumSize, maximumSize)
      if (!isSame) {
        throw {
          code: ErrorCode.ENTERED_PASSWORD_DIFFER,
          message: 'Entered passwords differ!',
        }
      }
      secretMaster.initCipherFromPassword(password)
    } finally {
      destroyBuffer(password)
      password = null
    }
    await secretMaster.saveSecret(secret)
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
    await self.loadSecret()

    if (plainFilepaths.length > 0) {
      const processBar = new progress.SingleBar(
        {
          format: 'encrypting {bar} {percentage}% | {value}/{total}',
          align: 'left',
          barsize: 50,
          stream: process.stdout,
          stopOnComplete: true,
        },
        progress.Presets.shades_classic)
      processBar.start(plainFilepaths.length, 0)
      const tasks: Promise<void>[] = []
      for (const plainFilepath of plainFilepaths) {
        const cipherFilepath = path.join(outputRelativePath, resolveDestPath(plainFilepath))
        const task = self.cipher.encryptFile(
          path.resolve(self.workspaceDir, plainFilepath),
          path.resolve(self.workspaceDir, cipherFilepath)
        )
          .then(() => {
            processBar.increment()
            console.log()
            logger.verbose(`[encryptFiles] encrypted (${ cipherFilepath }) --> (${ plainFilepath })`)
            console.log()
          })
          .catch(error => {
            console.log()
            logger.error(`[encryptFiles] failed: encrypting (${ cipherFilepath }) --> (${ plainFilepath })`)
            console.log()
            throw error
          })
        tasks.push(task)
      }
      await Promise.all(tasks)
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
    await self.loadSecret()

    if (cipherFilepaths.length > 0) {
      const processBar = new progress.SingleBar(
        {
          format: 'decrypting {bar} {percentage}% | {value}/{total}',
          align: 'left',
          barsize: 50,
          stream: process.stdout,
          stopOnComplete: true,
        },
        progress.Presets.shades_classic)
      processBar.start(cipherFilepaths.length, 0)
      const tasks: Promise<void>[] = []
      for (const cipherFilepath of cipherFilepaths) {
        const plainFilepath = path.join(outputRelativePath, resolveDestPath(cipherFilepath))
        const task = self.cipher.decryptFile(
          path.resolve(self.workspaceDir, cipherFilepath),
          path.resolve(self.workspaceDir, plainFilepath)
        )
          .then(() => {
            processBar.increment()
            console.log()
            logger.verbose(`[decryptFiles] decrypted (${ cipherFilepath }) --> (${ plainFilepath })`)
            console.log()
          })
          .catch(error => {
            console.log()
            logger.error(`[decryptFiles] failed: decrypting (${ cipherFilepath }) --> (${ plainFilepath })`)
            console.log()
            throw error
          })
        tasks.push(task)
      }
      await Promise.all(tasks)
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
    const cipherData: Buffer = await fs.readFile(indexFilepath)
    await self.loadSecret()

    const plainData: Buffer = self.cipher.decrypt(cipherData)
    const plainContent = plainData.toString('utf-8')
    const data: WorkspaceCatalogData = JSON.parse(plainContent)
    result = new WorkspaceCatalog({ ...data, cipherRelativeDir })
    return result
  }

  public async saveIndex(
    indexFilepath: string,
    catalog: WorkspaceCatalog,
  ): Promise<void> {
    const self = this
    const data: WorkspaceCatalogData = catalog.toData()
    const plainContent: Buffer = Buffer.from(JSON.stringify(data), 'utf-8')
    await self.loadSecret()

    const cipherData = self.cipher.encrypt(plainContent)
    await fs.writeFile(indexFilepath, cipherData)
  }
}
