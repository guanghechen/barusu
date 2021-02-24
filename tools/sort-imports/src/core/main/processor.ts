import fs from 'fs-extra'
import globby from 'globby'
import path from 'path'
import { logger } from '../../env/logger'
import { createCommentRegex } from '../../util/comment'
import { compareModulePath } from '../../util/module-rank'
import {
  StaticModuleStatementItem,
  createStaticImportOrExportRegexList,
  execWithMultipleRegex,
  extractStaticModuleStatementItem,
  formatStaticModuleStatementItem,
} from '../../util/module-statement'
import { SortImportsContext } from './context'


export class SortImportsProcessor {
  protected readonly context: SortImportsContext
  protected readonly staticImportOrExportRegexList: RegExp[]

  /**
   * Regular expression to match the comment at the top of the module
   */
  protected readonly topCommentRegex: RegExp

  public constructor(
    context: SortImportsContext,
    staticImportOrExportRegexList: RegExp[] = createStaticImportOrExportRegexList('g'),
    topCommentRegex: RegExp = createCommentRegex(),
  ) {
    this.context = context

    for (let i = 0; i < staticImportOrExportRegexList.length; ++i) {
      const regex = staticImportOrExportRegexList[i]
      if (regex.flags.indexOf('g') < 0) {
        // eslint-disable-next-line no-param-reassign
        staticImportOrExportRegexList[i] = new RegExp(regex, regex.flags + 'g')
      }
    }

    this.staticImportOrExportRegexList = staticImportOrExportRegexList
    this.topCommentRegex = new RegExp('^(' + topCommentRegex.source + '|\\s*)*')
  }

  public async sortStatements(): Promise<void> {
    const { encoding, pattern } = this.context
    await globby(pattern, { onlyFiles: true, expandDirectories: false })
      .then(matchedPaths => {
        for (const m of matchedPaths) {
          const absolutePath = path.resolve(m)
          logger.debug('absolutePath:', absolutePath)

          const content: string = fs.readFileSync(absolutePath, encoding).toString()
          const resolvedContent: string = this.process(content)
          if (content !== resolvedContent) {
            logger.info('processing:', absolutePath)
          }
          fs.writeFileSync(absolutePath, resolvedContent, encoding)
        }
      })
  }

  protected process(content: string): string {
    const self = this
    const items: StaticModuleStatementItem[] = []
    const m = self.topCommentRegex.exec(content)
    const firstNonCommentIndex = m == null ? 0 : m[0].length

    let startIndex = firstNonCommentIndex
    while (true) {
      const execResult = execWithMultipleRegex(
        this.staticImportOrExportRegexList, content, startIndex)
      if (execResult == null) break

      const { regex, result: m } = execResult
      if (!/^[;\s]*$/.test(content.substring(startIndex, m.index))) break

      const item = extractStaticModuleStatementItem(m.groups!) as StaticModuleStatementItem
      item.fullStatement = self.format(item)
      items.push(item)
      startIndex = regex.lastIndex
    }

    if (startIndex <= firstNonCommentIndex) return content.trimLeft()
    const newStatements: string = items
      .sort(self.compare.bind(self))
      .map(item => item.fullStatement).join('\n')
    return (
      content.slice(0, firstNonCommentIndex) +
      (
        newStatements +
        '\n' +
        ''.padStart(self.context.blankLinesAfterStatement, '\n') +
        content.slice(startIndex).trimLeft()
      ).trimRight() +
      '\n'
    )
  }

  protected format(item: Omit<StaticModuleStatementItem, 'fullStatement'>): string {
    const { quote, indent, semicolon, maxColumn } = this.context
    return formatStaticModuleStatementItem(item, quote, indent, semicolon, maxColumn)
  }

  protected compare(x: StaticModuleStatementItem, y: StaticModuleStatementItem): number {
    if (x.type !== y.type) {
      return this.context.typeRank[x.type] - this.context.typeRank[y.type]
    }

    // Check if the the type import/export statements should rank ahead
    if (this.context.typeFirst && x.keywordType !== y.keywordType) {
      return x.keywordType ? -1 : 1
    }

    if (x.moduleName !== y.moduleName) {
      return compareModulePath(x.moduleName, y.moduleName, this.context.moduleRanks)
    }

    if (x.fullStatement === y.fullStatement) return 0
    return x.fullStatement < y.fullStatement ? -1 : 1
  }
}
