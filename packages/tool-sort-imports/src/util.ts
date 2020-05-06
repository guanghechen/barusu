import { ColorfulChalkLogger, INFO } from '@barusu/chalk-logger'


export const logger = new ColorfulChalkLogger('sort-imports', {
  level: INFO,
  date: true,
}, process.argv)


/**
 * 创建匹配静态 import/export 的正则表达式
 */
export function createStaticImportOrExportRegex(flags?: string): RegExp {
  const typeRegex = /(?<type>import|export)/
  const defaultExportRegex = /(?:\s+(?<defaultExport>[\w*]+(?:\s+as\s+[\w]+)?(?:\s*,\s*[\w*]+\s+as\s+[\w]+)?)(?:\s*,)?)/
  const exportNRegex = /(?:\s+\{\s*(?<exportN>(?:[\w]+(?:\s+as\s+[\w]+)?\s*,\s*)*[\w]+(?:\s+as\s+[\w]+)?(?:\s*,)?)\s*\})/
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
 * 比较两个路径的大小
 *  - npm 包排在最前面
 *  - 绝对路径排在相对路径前面
 *  - 相对路径，距离当前节点越远，优先级越高
 * @param p1
 * @param p2
 */
const npmPackageRegex = /^[\w@]/
const absoluteRegex = /^(\/|[A-Z]:)/
const relativeRegex = /^([.\/\\]+)([^\n]*)$/

export function compareModulePath(p1: string, p2: string, topModules: string[]): number {
  if (p1 === p2) return 0

  // topModules take precedence
  const tmIndex1 = topModules.indexOf(p1)
  const tmIndex2 = topModules.indexOf(p2)
  if (tmIndex1 >= 0 || tmIndex2 >= 0) {
    if (tmIndex1 >= 0) {
      if (tmIndex2 >= 0) return tmIndex1 - tmIndex2
      return -1
    }
    return 1
  }

  if (topModules.includes(p1) && !topModules.includes(p2)) return -1
  if (topModules.includes(p2) && !topModules.includes(p1)) return 1

  // compare npm package
  if (npmPackageRegex.test(p1)) {
    if (!npmPackageRegex.test(p2)) return -1
    return p1 < p2 ? -1 : 1
  }
  if (npmPackageRegex.test(p2)) return 1

  // compare absolute package
  if (absoluteRegex.test(p1)) {
    if (!absoluteRegex.test(p2)) return -1
    return p1 < p2 ? -1 : 1
  }
  if (absoluteRegex.test(p2)) return 1

  // compare relative package
  if (relativeRegex.test(p1) && relativeRegex.test(p2)) {
    const [, a1, b1] = relativeRegex.exec(p1)!
    const [, a2, b2] = relativeRegex.exec(p2)!
    if (a1 === a2) return b1 < b2 ? -1 : 1
    // './' < '../'
    return a1 < a2 ? -1 : 1
  }

  // fallback
  return p1 < p2 ? -1 : 1
}


export interface StaticImportOrExportStatItem {
  type: 'import' | 'export'
  moduleName: string
  fullStatement: string
  exportN: string[]
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
  quote = '\'',
  indent = ' ',
  maxColumn = 100,
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
    return result
  }

  let result = assembleStatement(false)
  if (result.length >= maxColumn && item.exportN) {
    // 将花括号中的 export 拆成多行
    result = assembleStatement(true)
  }
  return result
}
