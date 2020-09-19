export interface StaticModuleStatementItem {
  /**
   * Module reference type (import or export module)
   */
  type: 'import' | 'export'
  /**
   * Module name
   */
  moduleName: string
  /**
   * Entire import / export module statement
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
   * The from keyword 'type' is used, which means import / export types only
   *
   * Examples:
   *    import type { Handler } from 'module'
   *    export type { Handler } from 'module'
   */
  keywordType?: 'type'
  /**
   * The keyword 'from' is used
   */
  keywordFrom?: 'from'
  /**
   *
   */
  defaultExport?: string
}


export function createStaticImportOrExportRegexList(flags: string): RegExp[] {
  const optionalSpacesRegex = /\s*/
  const requiredSpacesRegex = /\s+/
  const remainOfLineRegex = /(?<remainOfLine>[^\n]*)/
  const fromRegex = /(?:(?<keywordFrom>from)\s+)/
  const moduleNameRegex = /(?:(?<quote>['"])(?<moduleName>[^'"]+)\k<quote>(?:\s*;+)?)/
  const typeRegex = /(?:\b(?<type>import|export))/
  const importTypeRegex = /(?:\b(?<type>import))/
  const exportTypeRegex = /(?:\b(?<type>export))/
  const importDefaultRegex = /(?:(?<defaultExport>(?:\w+\s*,\s*)?(?:\w+|\w\s+as\s+\w+|\*\s*as\s+\w+)))/
  const exportDefaultRegex = /(?:(?<defaultExport>(?:\*|\*\s*as\s+\w+)))/
  const importOrExportNRegex = /(?:(?<keywordType>type)?\s*?\{\s*(?<exportN>(?:[\w]+(?:\s+as\s+[\w]+)?\s*,\s*)*[\w]+(?:\s+as\s+[\w]+)?(?:\s*,)?)\s*?\})/

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
 * Run regex.exec all regexList, return the exec-result with minimum index
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
  let result: { regex: RegExp, result: RegExpExecArray } | null = null
  for (const regex of regexList) {
    regex.lastIndex = lastIndex
    const m = regex.exec(content)
    if (m != null) {
      if (result == null || result.result.index > m.index) {
        result = { regex, result: m }
      }
    }
  }
  return result
}


/**
 * Extract StaticModuleStatementItem from result.groups
 * @param groups
 */
export function extractStaticModuleStatementItem(
  groups: Record<string, string>
): Omit<StaticModuleStatementItem, 'fullStatement'> {
  const exportN: string[] = groups.exportN != null
    ? groups.exportN.split(/\s*,\s*/g)
    : []
  const item: Omit<StaticModuleStatementItem, 'fullStatement'> = {
    type: groups.type as 'import' | 'export',
    moduleName: groups.moduleName.replace(/([\/\\])\.[\/\\]/g, '$1').replace(/([\/\\])+/g, '$1'),
    exportN: exportN.filter(x => /\S/.test(x)).sort(),
    remainOfLine: groups.remainOfLine as string,
    keywordType: groups.keywordType as 'type' | undefined,
    keywordFrom: groups.keywordFrom as 'from' | undefined,
    defaultExport: groups.defaultExport,
  }
  return item
}


/**
 *
 * @param item
 * @param indent
 * @param maxColumn
 */
export function formatStaticModuleStatementItem(
  item: Omit<StaticModuleStatementItem, 'fullStatement'>,
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
        const keywordType = item.keywordType ? item.keywordType + ' ' : ''
        if (multiline) {
          result += ` ${keywordType}{\n` + item.exportN.map(x => indent + x + ',').join('\n') + '\n}'
        } else {
          result += ` ${keywordType}{ ${ item.exportN.join(', ') } }`
        }
      }
    }
    if (item.keywordFrom != null) result += ' ' + item.keywordFrom
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
