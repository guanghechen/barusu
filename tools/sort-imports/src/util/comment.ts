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
