import {
  ModuleRankItem,
  StaticImportOrExportStatItem,
  compareModulePath,
  createCommentRegex,
  createStaticImportOrExportRegex,
  defaultModuleRankItems,
  formatImportOrExportStatItem,
} from './util'
export {
  StaticImportOrExportStatItem,
  compareModulePath,
  createCommentRegex,
  createStaticImportOrExportRegex,
  formatImportOrExportStatItem,
} from './util'


export class StaticImportStatement {
  public readonly quote: string
  public readonly indent: string
  public readonly maxColumn: number
  public readonly itemRank: Record<StaticImportOrExportStatItem['type'], number>
  public readonly moduleRanks: ModuleRankItem[]
  public readonly staticImportOrExportRegex: RegExp
  public readonly topCommentRegex: RegExp

  public constructor(
    quote = '\'',
    indent = '  ',
    maxColumn = 100,
    moduleRanks: ModuleRankItem[] = defaultModuleRankItems.concat(),
    staticImportOrExportRegex: RegExp = createStaticImportOrExportRegex('g'),
    topCommentRegex: RegExp = createCommentRegex(),
  ) {
    if (staticImportOrExportRegex.flags.indexOf('g') < 0) {
      // eslint-disable-next-line no-param-reassign
      staticImportOrExportRegex = new RegExp(
        staticImportOrExportRegex, staticImportOrExportRegex.flags + 'g')
    }

    this.quote = quote
    this.indent = indent
    this.maxColumn = Number.isNaN(maxColumn) ? 100 : maxColumn,
    this.staticImportOrExportRegex = staticImportOrExportRegex
    this.topCommentRegex = new RegExp('^(' + topCommentRegex.source + '|\\s*)*')
    this.itemRank = {
      'import': 1,
      'export': 2,
    }
    this.moduleRanks = moduleRanks
  }

  public process(content: string): string {
    const self = this
    const items: StaticImportOrExportStatItem[] = []
    const regex: RegExp = this.staticImportOrExportRegex
    const m = self.topCommentRegex.exec(content)
    const firstNonCommentIndex = m == null ? 0 : m[0].length

    let startIndex = firstNonCommentIndex
    regex.lastIndex = startIndex
    for (let m: RegExpExecArray | null; (m = regex.exec(content)) != null;) {
      if (!/^[;\s]*$/.test(content.substring(startIndex, m.index))) break
      const { defaultExport, exportN: exportNStr, moduleName, type } = m.groups!
      const exportN: string[] = exportNStr == null ? [] : exportNStr.split(/\s*,\s*/g)
      const item = {
        defaultExport,
        exportN: exportN.filter(x => /\S/.test(x)).sort(),
        moduleName: moduleName.replace(/([\/\\])\.[\/\\]/g, '$1').replace(/([\/\\])+/g, '$1'),
        type: type as any,
      } as StaticImportOrExportStatItem
      item.fullStatement = self.format(item)
      items.push(item)
      startIndex = regex.lastIndex
    }

    if (startIndex <= firstNonCommentIndex) return content.trimLeft()
    const newStatements: string = items
      .sort(self.compare.bind(self))
      .map(item => item.fullStatement).join('\n')
    return (
      content.slice(0, firstNonCommentIndex)
      + (newStatements + '\n\n\n' + content.slice(startIndex).trimLeft()).trimRight()
      + '\n'
    )
  }

  protected format(item: Omit<StaticImportOrExportStatItem, 'fullStatement'>): string {
    const { quote, indent, maxColumn } = this
    return formatImportOrExportStatItem(item, quote, indent, maxColumn)
  }

  protected compare(x: StaticImportOrExportStatItem, y: StaticImportOrExportStatItem): number {
    if (x.type !== y.type) {
      return this.itemRank[x.type] - this.itemRank[y.type]
    }
    if (x.moduleName !== y.moduleName) {
      return compareModulePath(x.moduleName, y.moduleName, this.moduleRanks)
    }
    if (x.fullStatement === y.fullStatement) return 0
    return x.fullStatement < y.fullStatement ? -1 : 1
  }
}
