import crypto from 'crypto'
import fs from 'fs-extra'
import { destroyBuffer, destroyBuffers } from './buffer'
import { logger } from './logger'


/**
 * Create random initial vector
 */
export function createRandomIv(size = 32): Buffer {
  return crypto.randomBytes(size)
}


/**
 * Create random key of aes
 */
export function createRandomKey(size = 32): Buffer {
  return crypto.randomBytes(size)
}


export class AESCipher {
  protected readonly algorithm: crypto.CipherGCMTypes
  protected readonly iv: Buffer
  protected readonly key: Buffer

  public constructor(options: {
    algorithm?: crypto.CipherGCMTypes
    iv?: Buffer
    key?: Buffer
  } = {}) {
    this.algorithm = options.algorithm || 'aes-256-gcm'
    this.key = options.key || createRandomIv()
    this.iv = options.iv || createRandomIv()
  }

  /**
   * Encrypt plainData with AES-
   */
  encrypt(plainData: Buffer): Buffer {
    const { algorithm, key, iv } = this
    const encipher = crypto.createCipheriv(algorithm, key, iv)
    const cipherDataPieces: Buffer[] = []

    try {
      // encrypt data
      cipherDataPieces.push(encipher.update(plainData))
      cipherDataPieces.push(encipher.final())

      // collect encrypted data pieces
      const cipherData = Buffer.concat(cipherDataPieces)
      return cipherData
    } finally {
      destroyBuffers(cipherDataPieces)
    }
  }

  /**
   * Decrypt cipherData which encrypted with AES-
   */
  decrypt(cipherData: Buffer): Buffer {
    const { algorithm, key, iv } = this
    const decipher = crypto.createCipheriv(algorithm, key, iv)
    const plainDataPieces: Buffer[] = []

    try {
      // decrypt data
      plainDataPieces.push(decipher.update(cipherData))
      plainDataPieces.push(decipher.final())

      // collect decrypted data pieces
      const plainData = Buffer.concat(plainDataPieces)
      return plainData
    } finally {
      destroyBuffers(plainDataPieces)
    }
  }

  /**
   * Encrypt file with AES-
   */
  encryptFile(plainFilePath: string): Buffer {
    const plainData: Buffer = fs.readFileSync(plainFilePath)
    const cipherData: Buffer = this.encrypt(plainData)
    destroyBuffer(plainData)
    return cipherData
  }

  /**
   * Decrypt file which encrypted with AES-
   */
  decryptFile(cipherFilePath: string): Buffer {
    const cipherData: Buffer = fs.readFileSync(cipherFilePath)
    return this.decrypt(cipherData)
  }
}
