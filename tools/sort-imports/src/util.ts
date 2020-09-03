import { CommandConfigurationOptions } from '@barusu/util-cli'


/**
 * 创建匹配静态 import/export 的正则表达式
 */
export function createStaticImportOrExportRegex(flags?: string): RegExp {
  const typeRegex = /(?<type>import|export)/
  const defaultExportRegex = /(?:\s+(?<defaultExport>[\w*]+(?:\s+as\s+[\w]+)?(?:\s*,\s*[\w*]+\s+as\s+[\w]+)?)(?:\s*,)?)/
  const exportNRegex = /(?:\s+\{\s*(?<exportN>(?:[\w]+(?:\s+as\s+[\w]+)?\s*,\s*)*[\w]+(?:\s+as\s+[\w]+)?(?:\s*,)?)\s*\})/
  const moduleNameRegex = /(?:\s+(?<quote>['"])(?<moduleName>[^'"]+)\k<quote>)(?:\s*;+)?/
  const remainOfLineRegex = /(?<remainOfLine>[^\n]*)/
  const regex = new RegExp(
    typeRegex.source
    + defaultExportRegex.source + '?'
    + exportNRegex.source + '?'
    + /(?:\s+from)/.source + '?'
    + moduleNameRegex.source
    + remainOfLineRegex.source
    , flags)
  return regex
}


/**
 * 创建匹配注释的正则表达式
 * @param flags
 */
export function createCommentRegex(flags?: string): RegExp {
  const inlineCommentRegex = /(?<inlineComment>\/\/[^\n]*)/
  const blockCommentRegex = /(?<blockComment>\/\*[\s\S]*?\*\/)/
  const regex = new RegExp(
    inlineCommentRegex.source
    + '|' + blockCommentRegex.source
    , flags)
  return regex
}


/**
 *
 */
export interface ModuleRankItem {
  /**
   *
   */
  regex: RegExp
  /**
   * Rank of the module matched this.regex
   */
  rank: number
}


export const defaultModuleRankItems: ModuleRankItem[] = [
  { // npm package
    regex: /^[a-zA-Z\d][\w\-.]*/,
    rank: 1.1,
  },
  { // npm scoped package
    regex: /^@[a-zA-Z\d][\w\-.]*\/[a-zA-Z\d][\w\-.]*/,
    rank: 1.2,
  },
  { // paths alias
    regex: /^@\//,
    rank: 2.1,
  },
  { // absolute path
    regex: /^(?:\/|[a-zA-Z]:)/,
    rank: 3.1,
  },
  { // relative path (parent)
    regex: /^[.]{2}[\/\\][^\n]*/,
    rank: 3.2,
  },
  { // relative path
    regex: /^[.][\/\\][^\n]*/,
    rank: 3.3,
  }
]


/**
 * Compare the two module paths and determine which one should be ranked first
 * @param p1          path of module1
 * @param p2          path of module2
 * @param moduleItems module priority infos
 */
export function compareModulePath(
  p1: string,
  p2: string,
  moduleItems: ModuleRankItem[]
): number {
  if (p1 === p2) return 0
  let rankOfP1: number | null = null
  let rankOfP2: number | null = null

  for (const moduleItem of moduleItems) {
    if (rankOfP1 == null && moduleItem.regex.test(p1)) {
      rankOfP1 = moduleItem.rank
    }
    if (rankOfP2 == null && moduleItem.regex.test(p2)) {
      rankOfP2 = moduleItem.rank
    }
  }

  /**
   * If there is only one specified rank in p1 and p2, the one assigned the
   * rank will take precedence.
   *
   * Otherwise, If Both the rank of p1 and p2 are not specified or specified
   * with same rank, then just simply compare their lexicographic order
   */
  if (rankOfP1 != null) {
    if (rankOfP2 == null) return -1
    if (rankOfP1 === rankOfP2) return p1 < p2 ? -1: 1
    return rankOfP1 < rankOfP2 ? -1 : 1
  }
  if (rankOfP2 != null) return 1
  return p1 < p2 ? -1 : 1
}


export interface StaticImportOrExportStatItem {
  type: 'import' | 'export'
  moduleName: string
  fullStatement: string
  exportN: string[]
  remainOfLine: string
  defaultExport?: string
}


/**
 *
 * @param item
 * @param indent
 * @param maxColumn
 */
export function formatImportOrExportStatItem(
  item: Omit<StaticImportOrExportStatItem, 'fullStatement'>,
  quote: string,
  indent: string,
  semicolon: boolean,
  maxColumn: number,
): string {
  const assembleStatement = (multiline: boolean): string => {
    let result: string = item.type
    if (item.defaultExport || item.exportN.length > 0) {
      if (item.defaultExport) {
        result += ' ' + item.defaultExport
        if (item.exportN.length > 0) result += ','
      }
      if (item.exportN.length > 0) {
        if (multiline) {
          result += ' {\n' + item.exportN.map(x => indent + x + ',').join('\n') + '\n}'
        } else {
          result += ` { ${ item.exportN.join(', ') } }`
        }
      }
      result += ' from'
    }
    result += ` ${ quote }${ item.moduleName }${ quote }`
    if (semicolon) result += ';'
    return result + item.remainOfLine
  }

  let result = assembleStatement(false)
  if (result.length >= maxColumn && item.exportN) {
    // 将花括号中的 export 拆成多行
    result = assembleStatement(true)
  }
  return result
}


/**
 *
 */
export interface CommandOptions extends CommandConfigurationOptions {
  /**
   * log level
   * @default undefined
   */
  logLevel?: 'debug' | 'verbose' | 'info' | 'warn' | 'error' | string
  /**
   * glob pattern of source file
   * @default []
   */
  pattern: string[]
  /**
   * encoding of source file
   * @default 'utf-8'
   */
  encoding: string
  /**
   * maximum column width
   * @default 80
   */
  maxColumn: number
  /**
   * indent of import/export statements in source codes
   * @default '  '
   */
  indent: string
  /**
   * quotation marker surround the module path
   * @default '\''
   */
  quote: string
  /**
   * whether to add a semicolon at the end of import/export statement
   * @default false
   */
  semicolon: boolean
  /**
   *
   * @default undefined
   */
  moduleRanks: ModuleRankItem[]
}


export const defaultCommandOptions: CommandOptions = {
  logLevel: undefined,
  pattern: [],
  encoding: 'utf-8',
  maxColumn: 80,
  indent: '  ',
  quote: '\'',
  semicolon: false,
  moduleRanks: [],
}
