import { createStaticImportOrExportRegex } from './util'


interface StaticImportStatItem {
  type: 'import' | 'export'
  moduleName: string
  fullStatement: string
  defaultExport?: string
  exportN?: string[]
}


class StaticImportStatement {
  public readonly indent: string
  public readonly maxColumn: number
  public readonly itemRank: Record<StaticImportStatItem['type'], number>
  public readonly staticImportOrExportRegex: RegExp

  public constructor(
    indent = '  ',
    maxColumn = 100,
    staticImportOrExportRegex: RegExp = createStaticImportOrExportRegex()
  ) {
    this.indent = indent
    this.maxColumn = maxColumn
    this.staticImportOrExportRegex = staticImportOrExportRegex
    this.itemRank = {
      'import': 1,
      'export': 2,
    }
  }

  public handle(content: string): string {
    const self = this
    const [endIndex, items] = self.collect(content)
    const newStatements: string = items
      .map(item => {
        const fullStatement = self.format(item)
        return { ...item, fullStatement }
      })
      .sort(self.compare)
      .map(item => item.fullStatement).join('\n')
    return newStatements + '\n\n\n' + content.slice(endIndex)
  }

  protected collect(content: string): [number, Omit<StaticImportStatItem, 'fullStatement'>[]] {
    const items: Omit<StaticImportStatItem, 'fullStatement'>[] = []
    return [-1, items]
  }

  protected format(item: Omit<StaticImportStatItem, 'fullStatement'>): string {
    const self = this
    const assembleStatement = (multiline: boolean): string => {
      let result: string = item.type
      if (item.defaultExport || item.exportN) {
        if (item.defaultExport) {
          result += ' ' + item.defaultExport
          if (item.exportN) result += ','
        }
        if (item.exportN) {
          if (multiline) {
            result += ' {\n' + item.exportN.map(x => self.indent + x + ',').join('\n') + '\n}'
          } else {
            result += ` { ${ item.exportN.join(', ') } }`
          }
        }
        result += ' from'
      }
      result += ` '${ item.moduleName }'`
      return result
    }

    let result = assembleStatement(false)
    if (result.length >= this.maxColumn && item.exportN) {
      // 将花括号中的 export 拆成多行
      result = assembleStatement(true)
    }
    return result
  }

  protected compare(x: StaticImportStatItem, y: StaticImportStatItem): number {
    if (x.type !== y.type) {
      return this.itemRank[x.type] - this.itemRank[y.type]
    }
    if (x.moduleName !== y.moduleName) {
      return x.moduleName < y.moduleName ? -1 : 1
    }
    if (x.fullStatement === y.fullStatement) return 0
    return x.fullStatement < y.fullStatement ? -1 : 1
  }
}
