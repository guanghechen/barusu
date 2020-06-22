import fs from 'fs-extra'
import path from 'path'
import { AESCipher } from '../aes-cipher'
import { destroyBuffer } from '../buffer'
import { logger } from '../logger'
import { WorkspaceCatalog, WorkspaceCatalogData } from './catalog'
import { PasswordMaster, PasswordMasterParams } from './password'


export interface CipherMasterParams extends PasswordMasterParams {
  /**
   *
   */
  workspaceDir: string
}


export class CipherMaster extends PasswordMaster {
  protected readonly workspaceDir: string

  public constructor(params: CipherMasterParams) {
    super(params)
    this.workspaceDir = params.workspaceDir
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
}
