import crypto from 'crypto'
import path from 'path'
import { ERROR_CODE } from '../error'
import { logger } from '../logger'


export interface CatalogItem {
  /**
   *
   */
  plainFilepath: string
  /**
   *
   */
  cipherFilepath: string
}


export interface WorkspaceCatalogData {
  /**
   * plain-cipher file records
   */
  items: CatalogItem[]
}


export interface WorkspaceCatalogParams extends WorkspaceCatalogData {
  /**
   *
   */
  cipherRelativeDir: string
}


export class WorkspaceCatalog {
  protected readonly items: CatalogItem[]
  protected readonly cipherRelativeDir: string
  protected readonly plainFilepathMap: { [key: string]: CatalogItem }
  protected readonly cipherFilepathMap: { [key: string]: CatalogItem }

  public constructor(params: WorkspaceCatalogParams) {
    this.items = []
    this.plainFilepathMap = {}
    this.cipherFilepathMap = {}
    this.cipherRelativeDir = params.cipherRelativeDir
    for (const item of params.items) {
      this.addItem(item)
    }
  }

  public toData(): WorkspaceCatalogData {
    return {
      items: this.items,
    }
  }

  public addItem({ plainFilepath, cipherFilepath }: CatalogItem): void {
    const item: CatalogItem = {
      plainFilepath: this.calcKey(plainFilepath),
      cipherFilepath: this.calcKey(cipherFilepath),
    }

    if (this.plainFilepathMap[item.plainFilepath] != null) {
      const existedItem = this.plainFilepathMap[item.plainFilepath]
      if (item.cipherFilepath === existedItem.cipherFilepath) return
      logger.warn(`Duplicated catalog item with same plainFilepath (${ item.plainFilepath }). Skipped`)
      return
    }

    if (this.cipherFilepathMap[item.cipherFilepath] != null) {
      const existedItem = this.cipherFilepathMap[item.cipherFilepath]
      if (item.plainFilepath === existedItem.plainFilepath) return
      throw {
        code: ERROR_CODE.DUPLICATED_CIPHER_FILEPATH,
        message: `Duplicated catalog item with same cipherFilepath (${ item.cipherFilepath })`
      }
    }

    this.plainFilepathMap[item.plainFilepath] = item
    this.cipherFilepathMap[item.cipherFilepath] = item
    this.items.push(item)
  }

  public getItemByPlainFilepath(plainFilepath: string): CatalogItem | null {
    const key = this.calcKey(plainFilepath)
    const item = this.plainFilepathMap[key]
    if (item != null) return { ...item }
    return null
  }

  public getItemByCipherFilepath(cipherFilepath: string): CatalogItem | null {
    const key = this.calcKey(cipherFilepath)
    const item = this.cipherFilepathMap[key]
    if (item != null) return { ...item }
    return null
  }

  public resolveCipherFilepath(plainFilepath: string): string {
    const item = this.getItemByPlainFilepath(plainFilepath)
    if (item != null) return this.calcPath(item.cipherFilepath)

    // create new item
    const cipherFilename: string = crypto.randomBytes(32).toString('hex')
    const newItem: CatalogItem = { plainFilepath, cipherFilepath: cipherFilename }
    this.addItem(newItem)

    return this.calcPath(newItem.cipherFilepath)
  }

  public resolvePlainFilepath(cipherFilepath: string): string | null {
    const item = this.getItemByCipherFilepath(cipherFilepath)
    if (item != null) return this.calcPath(item.plainFilepath)
    return null
  }

  protected calcKey(filepath: string): string {
    return path.normalize(filepath).replace(/[/\\]+/g, '/')
  }

  protected calcPath(key: string): string {
    return path.normalize(key)
  }
}
