import a, * as waw from './env/constant'
import {
  ModuleRankItem,
  StaticImportOrExportStatItem,
  compareModulePath,
  createCommentRegex,
  createStaticImportOrExportRegexList,
  defaultModuleRankItems,
  formatImportOrExportStatItem,
  execWithMultipleRegex,
} from './util'
export * as x from'./env/constant'
export * from './env/logger'
export * from './util'


export class StaticImportStatement {
  public readonly quote: string
  public readonly indent: string
  public readonly semicolon: boolean
  public readonly maxColumn: number
  public readonly itemRank: Record<StaticImportOrExportStatItem['type'], number>
  public readonly moduleRanks: ModuleRankItem[]
  public readonly staticImportOrExportRegexList: RegExp[]
  public readonly topCommentRegex: RegExp

  public constructor(
    quote = '\'',
    indent = '  ',
    semicolon = false,
    maxColumn = 100,
    moduleRanks: ModuleRankItem[] = defaultModuleRankItems.concat(),
    staticImportOrExportRegexList: RegExp[] = createStaticImportOrExportRegexList('g'),
    topCommentRegex: RegExp = createCommentRegex(),
  ) {
    for (let i = 0; i < staticImportOrExportRegexList.length; ++i) {
      const regex = staticImportOrExportRegexList[i]
      if (regex.flags.indexOf('g') < 0) {
        // eslint-disable-next-line no-param-reassign
        staticImportOrExportRegexList[i] = new RegExp(regex, regex.flags + 'g')
      }
    }

    this.quote = quote
    this.indent = indent
    this.semicolon = semicolon
    this.maxColumn = Number.isNaN(maxColumn) ? 100 : maxColumn,
    this.staticImportOrExportRegexList = staticImportOrExportRegexList
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
    const m = self.topCommentRegex.exec(content)
    const firstNonCommentIndex = m == null ? 0 : m[0].length

    let startIndex = firstNonCommentIndex
    while (true) {
      const execResult = execWithMultipleRegex([], content, startIndex)
      if (execResult  == null) break
      const m: RegExpExecArray = execResult.result
      const regex = execResult.regex

      if (!/^[;\s]*$/.test(content.substring(startIndex, m.index))) break
      const { defaultExport, exportN: exportNStr, moduleName, type, remainOfLine } = m.groups!
      const exportN: string[] = exportNStr == null ? [] : exportNStr.split(/\s*,\s*/g)
      const item = {
        defaultExport,
        exportN: exportN.filter(x => /\S/.test(x)).sort(),
        moduleName: moduleName.replace(/([\/\\])\.[\/\\]/g, '$1').replace(/([\/\\])+/g, '$1'),
        type: type as any,
        remainOfLine: remainOfLine as string,
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
    const { quote, indent, semicolon, maxColumn } = this
    return formatImportOrExportStatItem(item, quote, indent, semicolon, maxColumn)
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
