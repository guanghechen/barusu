export interface StaticImportOrExportStatItem {
  /**
   *
   */
  type: 'import' | 'export'
  /**
   *
   */
  moduleName: string
  /**
   *
   */
  fullStatement: string
  /**
   *
   */
  exportN: string[]
  /**
   *
   */
  remainOfLine: string
  /**
   * Whether is type import (i.e. import type { Handler } from 'module')
   */
  typeImportOrExport?: 'type'
  /**
   *
   */
  defaultExport?: string
}


export function createStaticImportOrExportRegexList(flags: string): RegExp[] {
  const optionalSpacesRegex = /\s*/
  const requiredSpacesRegex = /\s+/
  const remainOfLineRegex = /(?<remainOfLine>[^\n]*)/
  const fromRegex = /(?:(?<from>from)\s+)/
  const moduleNameRegex = /(?:(?<quote>['"])(?<moduleName>[^'"]+)\k<quote>(?:\s*;+)?)/
  const typeRegex = /(?:\b(?<type>import|export))/
  const importTypeRegex = /(?:\b(?<type>import))/
  const exportTypeRegex = /(?:\b(?<type>export))/
  const importDefaultRegex = /(?:(?<defaultExport>(?:\w+\s*,\s*)?(?:\w+|\w\s+as\s+\w+|\*\s*as\s+\w+)))/
  const exportDefaultRegex = /(?:(?<defaultExport>(?:\*|\*\s*as\s+\w+)))/
  const importOrExportNRegex = /(?:(?<typeImportOrExport>type)?\s*?\{\s*(?<exportN>(?:[\w]+(?:\s+as\s+[\w]+)?\s*,\s*)*[\w]+(?:\s+as\s+[\w]+)?(?:\s*,)?)\s*?\})/

  const regexList = [
    /**
     * Import only
     *
     *  ```typescript
     *  import 'module'
     *  import 'module';
     *  ```
     */
    new RegExp(
      importTypeRegex.source + optionalSpacesRegex.source +
      moduleNameRegex.source + remainOfLineRegex.source,
      flags),
    /**
     * Import default
     *
     *  ```typescript
     *  import a from 'module'
     *  import a as b from 'module'
     *  import * as b from 'module'
     *  import a, * as b from 'module'
     *  ```
     */
    new RegExp(
      importTypeRegex.source + requiredSpacesRegex.source +
      importDefaultRegex.source + requiredSpacesRegex.source + fromRegex.source +
      moduleNameRegex.source + remainOfLineRegex.source,
      flags),
    /**
     * Export default
     *
     *  ```typescript
     *  export * as b from 'module'
     *  export * from 'module'
     *  ```
     */
    new RegExp(
      exportTypeRegex.source + optionalSpacesRegex.source +
      exportDefaultRegex.source + requiredSpacesRegex.source + fromRegex.source +
      moduleNameRegex.source + remainOfLineRegex.source,
      flags),
    /**
     * ImportN
     *
     *  ```typescript
     *  import { a as b, c, d as e } from 'module'
     *  import type { Logger } from '@barusu/chalk-logger'
     *  export { a as b, c, d as e } from 'module'
     *  export type { Logger } from '@barusu/chalk-logger'
     *  ```
     */
    new RegExp(
      typeRegex.source + optionalSpacesRegex.source +
      importOrExportNRegex.source + optionalSpacesRegex.source + fromRegex.source +
      moduleNameRegex.source + remainOfLineRegex.source,
      flags),
    /**
     * Import default + ImportN
     *  ```typescript
     *  import x, { a as b, c, d as e } from 'module'
     *  import a as b, type { Logger } from '@barusu/chalk-logger'
     *  import * as e, type { Logger } from '@barusu/chalk-logger'
     *  ```
     */
    new RegExp(
      importTypeRegex.source + optionalSpacesRegex.source +
      importDefaultRegex.source + /(?:\s*,\s*)/.source + importOrExportNRegex.source +
      optionalSpacesRegex.source + fromRegex.source +
      moduleNameRegex.source + remainOfLineRegex.source,
      flags),
  ]

  return regexList
}


/**
 * Run regex.exec all regexList, return the first non-null value
 *
 * @param regexList
 * @param content
 * @param lastIndex   first position of content to preform regex.exec
 */
export function execWithMultipleRegex(
  regexList: RegExp[],
  content: string,
  lastIndex = 0
): { regex: RegExp, result: RegExpExecArray } | null {
  for (const regex of regexList) {
    regex.lastIndex = lastIndex
    const result = regex.exec(content)
    if (result != null) return { regex, result }
  }
  return null
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
    if (rankOfP1 === rankOfP2) return p1 < p2 ? -1 : 1
    return rankOfP1 < rankOfP2 ? -1 : 1
  }
  if (rankOfP2 != null) return 1
  return p1 < p2 ? -1 : 1
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
