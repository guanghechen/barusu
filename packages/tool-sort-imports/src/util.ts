/**
 * 创建匹配静态 import/export 的正则表达式
 */
export function createStaticImportOrExportRegex(flags?: string): RegExp {
  const typeRegex = /(?<type>import|export)/
  const defaultExportRegex = /(?:\s+(?<defaultExport>[\w*]+(?:\s+as\s+[\w]+)?(?:\s*,\s*[\w*]+\s+as\s+[\w]+)?(?:\s*,)?))/
  const exportNRegex = /(?:\s+\{\s*(?<exportN>(?:[\w]+(?:\s+as\s+[\w]+)?\s*,\s*)*[\w]+(?:\s+as\s+[\w]+)?)\s*\})/
  const moduleNameRegex = /(?:\s+(?<quote>['"])(?<moduleName>[^'"]+)\k<quote>)/
  const regex = new RegExp(
    typeRegex.source
    + defaultExportRegex.source + '?'
    + exportNRegex.source + '?'
    + /(?:\s+from)/.source + '?'
    + moduleNameRegex.source
  , flags)
  return regex
}


export interface StaticImportOrExportStatItem {
  type: 'import' | 'export'
  moduleName: string
  fullStatement: string
  defaultExport?: string
  exportN?: string[]
}


/**
 *
 * @param item
 * @param indent
 * @param maxColumn
 */
export function formatImportOrExportStatItem(
  item: Omit<StaticImportOrExportStatItem, 'fullStatement'>,
  indent = ' ',
  maxColumn = 100,
): string {
  const assembleStatement = (multiline: boolean): string => {
    let result: string = item.type
    if (item.defaultExport || item.exportN) {
      if (item.defaultExport) {
        result += ' ' + item.defaultExport
        if (item.exportN) result += ','
      }
      if (item.exportN) {
        if (multiline) {
          result += ' {\n' + item.exportN.map(x => indent + x + ',').join('\n') + '\n}'
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
  if (result.length >= maxColumn && item.exportN) {
    // 将花括号中的 export 拆成多行
    result = assembleStatement(true)
  }
  return result
}
