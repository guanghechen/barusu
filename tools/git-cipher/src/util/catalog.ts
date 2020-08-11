import crypto from 'crypto'
import fs from 'fs-extra'
import path from 'path'
import { collectAllFilesSync, relativeOfWorkspace } from '@barusu/util-cli'
import { coverString, isNotEmptyString } from '@barusu/util-option'
import { destroyBuffer } from './buffer'
import { Cipher } from './cipher'
import { ErrorCode } from './events'


/**
 * Entries in the index table of ciphertext files
 */
export interface WorkspaceCatalogItem {
  /**
   * Last modify time of the plaintext file (ISO date string)
   */
  mtime: string
  /**
   * Filepath of plaintext data (relative path of the source git repository)
   */
  plaintextFilepath: string
  /**
   * Filepath of ciphertext data (relative path of the ciphertext files root directory)
   */
  ciphertextFilepath: string
}


/**
 * Index table of ciphertext files
 */
export interface WorkspaceCatalogData {
  /**
   * Last modify time of the contents of the workspace
   */
  mtime: string | null
  /**
   * Filepath map records
   */
  items: WorkspaceCatalogItem[]
}


/**
 * Params of constructor of WorkspaceCatalog
 */
export interface WorkspaceCatalogParams {
  /**
   * A collect of util funcs for encryption / decryption
   */
  readonly cipher: Cipher
  /**
   * Root directory of plaintext files
   */
  readonly plaintextRootDir: string
  /**
   * Root directory of ciphertext files
   */
  readonly ciphertextRootDir: string
  /**
   * Encoding of index file
   * @default 'utf-8'
   */
  readonly indexFileEncoding?: string
  /**
   * Encoding of index file content
   * @default 'base64'
   */
  readonly indexContentEncoding?: BufferEncoding
}


/**
 * Index table of the ciphertext workspace
 */
export class WorkspaceCatalog {
  protected readonly cipher: Cipher
  protected readonly plaintextRootDir: string
  protected readonly ciphertextRootDir: string
  protected readonly indexFileEncoding: string
  protected readonly indexContentEncoding: BufferEncoding
  protected readonly items: Readonly<WorkspaceCatalogItem>[]
  protected readonly plaintextFilepathMap: Map<string, Readonly<WorkspaceCatalogItem>>
  protected readonly ciphertextFilepathMap: Map<string, Readonly<WorkspaceCatalogItem>>
  protected mtime: string | null

  public constructor(params: WorkspaceCatalogParams) {
    this.cipher = params.cipher
    this.indexFileEncoding= coverString(
      'utf-8', params.indexFileEncoding, isNotEmptyString)
    this.indexContentEncoding= coverString(
      'base64', params.indexContentEncoding, isNotEmptyString) as BufferEncoding
    this.plaintextRootDir = params.plaintextRootDir
    this.ciphertextRootDir = params.ciphertextRootDir
    this.items = []
    this.plaintextFilepathMap = new Map()
    this.ciphertextFilepathMap = new Map()
    this.mtime = null
  }

  /**
   * Load data from index file
   * @param indexFilepath absolute filepath of index file
   */
  public async load(indexFilepath: string): Promise<void> {
    if (!fs.existsSync(indexFilepath)) {
      throw {
        code: ErrorCode.FILEPATH_NOT_FOUND,
        message: `cannot find index file (${ indexFilepath })`
      }
    }

    const {
      indexFileEncoding,
      indexContentEncoding,
    } = this

    // load content from index file
    const rawCiphertextContent = await fs.readFile(indexFilepath, indexFileEncoding)
    const ciphertextContent: Buffer = Buffer.from(rawCiphertextContent, indexContentEncoding)

    // do decryption
    const rawContent = this.cipher.decrypt(ciphertextContent)

    // remove salt
    const content = this.removeSalt(rawContent.toString())

    // parse the content
    const { mtime, items } = JSON.parse(content)
    this.mtime = mtime
    this.items.splice(0, this.items.length, ...items)
    this.plaintextFilepathMap.clear()
    this.ciphertextFilepathMap.clear()
    for (const item of this.items) {
      this.plaintextFilepathMap.set(item.plaintextFilepath, item)
      this.ciphertextFilepathMap.set(item.ciphertextFilepath, item)
    }
  }

  /**
   * Dump the data into index file
   * @param indexFilepath absolute filepath of index file
   */
  public async save(indexFilepath: string): Promise<void> {
    const { cipher, indexContentEncoding, indexFileEncoding } = this


    // dump to data
    const data: WorkspaceCatalogData = {
      mtime: this.mtime,
      items: this.items,
    }
    const plaintextContent = JSON.stringify(data)

    // add salt
    const content = this.insertSalt(plaintextContent)

    // save into the index file
    const plainTextData: Buffer = Buffer.from(content, 'utf-8')
    const ciphertextData = cipher.encrypt(plainTextData).toString(indexContentEncoding)
    destroyBuffer(plainTextData)
    await fs.writeFile(indexFilepath, ciphertextData, indexFileEncoding)
  }

  /**
   * update mtime of the workspace
   * @param mtime
   */
  public touch(mtime: string): void {
    // shouldn't go back to an earlier time
    if (this.mtime != null && this.mtime.localeCompare(mtime) >= 0) return
    this.mtime = mtime
  }

  /**
   * add entry into the index table
   * @param absolutePlaintextFilepath
   * @returns {string | never} absoluteCiphertextFilepath
   */
  public insertOrUpdateItem(absolutePlaintextFilepath: string): string | never {
    const stat = fs.statSync(absolutePlaintextFilepath)
    const mtime = (new Date(stat.mtime)).toISOString()
    const plaintextFilepath = this.resolvePlaintextFilepath(absolutePlaintextFilepath)

    // If it is existed, then just update the mtime
    const oldItem = this.plaintextFilepathMap.get(plaintextFilepath)
    if (oldItem != null) {
      ; (oldItem as WorkspaceCatalogItem).mtime = mtime
      return this.resolveAbsoluteCiphertextFilepath(oldItem.ciphertextFilepath)
    }

    // Otherwise, create new item
    let ciphertextFilepath: string = crypto.randomBytes(32).toString('hex')
    while (this.ciphertextFilepathMap.has(ciphertextFilepath)) {
      ciphertextFilepath = crypto.randomBytes(32).toString('hex')
    }

    const item: WorkspaceCatalogItem = {
      mtime,
      plaintextFilepath,
      ciphertextFilepath,
    }

    // if not exists, then insert it
    if (!this.plaintextFilepathMap.has(plaintextFilepath)) {
      this.items.push(item)
    }

    this.plaintextFilepathMap.set(plaintextFilepath, item)
    this.ciphertextFilepathMap.set(ciphertextFilepath, item)
    return this.resolveAbsoluteCiphertextFilepath(ciphertextFilepath)
  }

  /**
   * remove entry from the index table
   * @param absoluteCiphertextFilepath
   *
   */
  public removeItem(absoluteCiphertextFilepath: string): void {
    const ciphertextFilepath = this.resolveCiphertextFilepath(absoluteCiphertextFilepath)
    const item = this.ciphertextFilepathMap.get(ciphertextFilepath)
    if (item == null) {
      console.error(
        `[NOT FOUND] absoluteCiphertextFilepath(${ absoluteCiphertextFilepath })` +
        ' is not existed in the index table'
      )
      return
    }

    this.ciphertextFilepathMap.delete(ciphertextFilepath)
    this.plaintextFilepathMap.delete(item.plaintextFilepath)
    this.items.splice(
      this.items.findIndex(x => x.plaintextFilepath === item.plaintextFilepath),
      1
    )
  }

  /**
   * Check if the file is damaged
   */
  public checkIntegrity(): void | never {
    const allCiphertextFiles = collectAllFilesSync(this.ciphertextRootDir, null)
    if (allCiphertextFiles.length !== this.items.length) {
      throw new Error(`[INTEGRITY DAMAGE] there are ${ this.items.length } files in index file, but actually there are ${ allCiphertextFiles.length } files in the cipher directory`)
    }

    let damaged = false
    for (const item of this.items) {
      const absoluteCiphertextFilepath = this.resolveAbsoluteCiphertextFilepath(item.ciphertextFilepath)
      if (!fs.existsSync(absoluteCiphertextFilepath)) {
        console.error(`[INTEGRITY DAMAGE] cannot found ${ absoluteCiphertextFilepath }`)
        damaged = true
      }
    }

    if (damaged) {
      process.exit(-1)
    }
  }

  /**
   * adds some characters for obfuscation
   * @param content
   */
  protected insertSalt(content: string): string {
    const startSaltSize = Math.ceil(Math.random() * 25)
    const endSaltSize = Math.ceil(Math.random() * 25)
    return (
      crypto.randomBytes(startSaltSize).toString('hex') +
      content +
      crypto.randomBytes(endSaltSize).toString('hex')
    )
  }

  /**
   * remove salts
   * @param content
   */
  protected removeSalt(content: string): string {
    return content
      .replace(/^[0-9a-z]+/, '')
      .replace(/[0-9a-z]+$/, '')
  }

  /**
   * resolve the relative filepath of the plaintext data
   * @param absolutePlaintextFilepath
   * @returns {string} plaintextFilepath
   */
  protected resolvePlaintextFilepath(absolutePlaintextFilepath: string): string {
    const plaintextFilepath = relativeOfWorkspace(
      this.plaintextRootDir, absolutePlaintextFilepath)
    return path.normalize(plaintextFilepath).replace(/[/\\]+/g, '/')
  }

  /**
   * resolve the absolute filepath of plaintext
   * @param plaintextFilepath
   * @returns {string} absolutePlaintextFilepath
   */
  protected resolveAbsolutePlaintextFilepath(plaintextFilepath: string): string {
    return path.resolve(this.plaintextRootDir, plaintextFilepath)
  }

  /**
   * resolve the relative filepath of the ciphertext data
   * @param absoluteCiphertextFilepath
   * @returns {string} ciphertextFilepath
   */
  protected resolveCiphertextFilepath(absoluteCiphertextFilepath: string): string {
    const ciphertextFilepath = relativeOfWorkspace(
      this.ciphertextRootDir, absoluteCiphertextFilepath)
    return path.normalize(ciphertextFilepath).replace(/[/\\]+/g, '/')
  }

  /**
   * resolve the absolute filepath of ciphertext
   * @param ciphertextFilepath
   * @returns {string} absoluteCiphertextFilepath
   */
  protected resolveAbsoluteCiphertextFilepath(ciphertextFilepath: string): string {
    return path.resolve(this.ciphertextRootDir, ciphertextFilepath)
  }
}
