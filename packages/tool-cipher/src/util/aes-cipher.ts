import crypto from 'crypto'
import fs from 'fs-extra'
import { destroyBuffers } from './buffer'


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
  public encrypt(plainData: Buffer): Buffer {
    const { algorithm, key, iv } = this
    const encipher = crypto.createCipheriv(algorithm, key, iv)

    let cipherData: Buffer
    const cipherDataPieces: Buffer[] = []
    try {
      // encrypt data
      cipherDataPieces.push(encipher.update(plainData))
      cipherDataPieces.push(encipher.final())

      // collect encrypted data pieces
      cipherData = Buffer.concat(cipherDataPieces)
      return cipherData
    } finally {
      destroyBuffers(cipherDataPieces)
    }
  }

  /**
   * Decrypt cipherData which encrypted with AES-
   */
  public decrypt(cipherData: Buffer): Buffer {
    const { algorithm, key, iv } = this
    const decipher = crypto.createCipheriv(algorithm, key, iv)

    let plainData: Buffer
    const plainDataPieces: Buffer[] = []
    try {
      // decrypt data
      plainDataPieces.push(decipher.update(cipherData))
      plainDataPieces.push(decipher.final())

      // collect decrypted data pieces
      plainData = Buffer.concat(plainDataPieces)
    } finally {
      destroyBuffers(plainDataPieces)
    }
    return plainData
  }

  /**
   * Encrypt file with AES-
   */
  public encryptFile(
    plainFilepath: string,
    cipherFilepath: string,
  ): Promise<void> {
    const { algorithm, key, iv } = this
    const encipher = crypto.createCipheriv(algorithm, key, iv)
    const rStream = fs.createReadStream(plainFilepath)
    const wStream = fs.createWriteStream(cipherFilepath)

    return new Promise((resolve, reject) => {
      rStream
        .pipe(encipher)
        .pipe(wStream)
        .on('finish', resolve)
        .on('error', reject)
    })
  }

  /**
   * Decrypt file which encrypted with AES-
   */
  public decryptFile(
    cipherFilepath: string,
    plainFilepath: string,
  ): Promise<void> {
    const { algorithm, key, iv } = this
    const decipher = crypto.createCipheriv(algorithm, key, iv)
    const rStream = fs.createReadStream(cipherFilepath)
    const wStream = fs.createWriteStream(plainFilepath)

    return new Promise((resolve, reject) => {
      rStream
        .pipe(decipher)
        .pipe(wStream)
        .on('finish', resolve)
        .on('error', reject)
    })
  }
}
