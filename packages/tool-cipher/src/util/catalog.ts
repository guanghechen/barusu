import { ERROR_CODE } from './error'
import { logger } from './logger'


export interface CatalogItem {
  plainFilepath: string
  cipherFilepath: string
}


export class WorkspaceCatalog {
  public readonly items: CatalogItem[]
  public readonly plainFilepathMap: { [key: string]: CatalogItem }
  public readonly cipherFilepathMap: { [key: string]: CatalogItem }

  public constructor (items: CatalogItem[]) {
    this.items = []
    this.plainFilepathMap = {}
    this.cipherFilepathMap = {}
    for (const item of items) {
      this.plainFilepathMap[item.plainFilepath] = item
      this.cipherFilepathMap[item.cipherFilepath] = item
    }
  }

  public collect(): CatalogItem[] {
    return this.items
  }

  public addItem (item: CatalogItem): void {
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

  public getItemByPlainFilepath (plainFilepath: string): CatalogItem | null {
    const item = this.plainFilepathMap[plainFilepath]
    if (item != null) return { ...item }
    return null
  }

  public getItemByCipherFilepath (cipherFilepath: string): CatalogItem | null {
    const item = this.cipherFilepathMap[cipherFilepath]
    if (item != null) return { ...item }
    return null
  }
}
