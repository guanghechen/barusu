import fs from 'fs-extra'
import globby from 'globby'
import path from 'path'
import { AESCipher, createRandomIv, createRandomKey } from './aes-cipher'
import { destroyBuffer } from './buffer'
import * as io from './io'


export class CipherMaster {
  /**
   * Read password from terminal
   */
  public async inputMasterPassword(): Promise<Buffer> {
    const password: Buffer = await io.input('Master Password')
    return password
  }

  /**
   * encrypt files matched specified glob patterns
   * @param secretFilePath      filepath of secret of the encryption algorithm
   * @param plainFilePatterns   glob patterns to match files to be encrypted
   * @param resolveDestPath     calc the output path of the encrypted content
   */
  public async encryptFiles(
    secretFilePath: string,
    plainFilePatterns: string[],
    resolveDestPath: (plainFilePath: string) => string,
  ): Promise<void> {
    const self = this
    const [iv, key] = await self.loadSecret(secretFilePath)
    const aesCipher = new AESCipher({ iv, key })

    try {
      if (plainFilePatterns.length > 0) {
        const paths = await globby(plainFilePatterns)
        for (const p of paths) {
          const destFilePath = resolveDestPath(p)
          let content: Buffer | null = null
          try {
            content = await fs.readFile(p)
            const cipherContent = aesCipher.encrypt(content)
            await fs.writeFile(destFilePath, cipherContent)
          } finally {
            if (content != null) {
              destroyBuffer(content)
              content = null
            }
          }
        }
      }
    } finally {
      destroyBuffer(iv)
      destroyBuffer(key)
    }
  }

  /**
   * decrypt files matched specified glob patterns
   * @param secretFilePath      filepath of secret of the decryption algorithm
   * @param cipherFilePatterns  glob patterns to match files to be decrypted
   * @param resolveDestPath     calc the output path of the decrypted content
   */
  public async decryptFiles(
    secretFilePath: string,
    cipherFilePatterns: string[],
    resolveDestPath: (cipherFilePath: string) => string,
  ): Promise<void> {
    const self = this
    const [iv, key] = await self.loadSecret(secretFilePath)
    const aesCipher = new AESCipher({ iv, key })

    try {
      if (cipherFilePatterns.length > 0) {
        const paths = await globby(cipherFilePatterns)
        for (const p of paths) {
          const destFilePath = resolveDestPath(p)
          let content: Buffer | null = null
          try {
            content = await fs.readFile(p)
            const cipherContent = aesCipher.decrypt(content)
            await fs.writeFile(destFilePath, cipherContent)
          } finally {
            if (content != null) {
              destroyBuffer(content)
              content = null
            }
          }
        }
      }
    } finally {
      destroyBuffer(iv)
      destroyBuffer(key)
    }
  }

  /**
   * load AES iv/key from encrypted secret file
   * @param secretFilePath      filepath of secret of the encryption/decryption algorithm
   */
  public async loadSecret(secretFilePath: string): Promise<[Buffer, Buffer]> {
    const self = this
    if (!fs.existsSync(secretFilePath)) {
      throw new Error(`cannot find secret file (${ secretFilePath })`)
    }

    let password: Buffer | null = null
    let originalIv: Buffer | null, originalKey: Buffer | null
    try {
      password = await self.inputMasterPassword()
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
      const content: Buffer = await fs.readFile(secretFilePath)
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

  public async generateSecretFile(secretFilePath: string): Promise<void> {
    const self = this

    let password: Buffer | null = null
    let originalIv: Buffer | null, originalKey: Buffer | null
    try {
      password = await self.inputMasterPassword()
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
      if (!fs.existsSync(path.dirname(secretFilePath))) {
        fs.mkdirpSync(path.dirname(secretFilePath))
      }
      await fs.writeFile(secretFilePath, cipherSecret)
    } finally {
      destroyBuffer(originalIv)
      destroyBuffer(originalKey)
      destroyBuffer(iv)
      destroyBuffer(key)
      destroyBuffer(plainSecret)
      destroyBuffer(cipherSecret)
    }
  }

  public async reGenerateSecretFile(
    secretFilePath: string,
    cipherFilePatterns: string[],
    resolveCipherFileDestPath: (cipherFilePath: string) => string,
  ): Promise<void> {
    const self = this
    if (!fs.existsSync(secretFilePath)) {
      throw new Error(`cannot find secret file (${ secretFilePath })`)
    }

    // waiting for ciphered data with old secret to be decrypted
    if (cipherFilePatterns.length > 0) {
      await self.decryptFiles(secretFilePath, cipherFilePatterns, resolveCipherFileDestPath)
    }

    // generate new secret
    await self.generateSecretFile(secretFilePath)
  }

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
