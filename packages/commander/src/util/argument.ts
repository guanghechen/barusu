/**
 *
 */
export interface Argument {
  /**
   * The name of the argument
   */
  name: string
  /**
   * Whether it is required
   */
  required: boolean
  /**
   * Whether it is a variadic
   */
  variadic: boolean
  /**
   * Human readable format
   */
  friendlyDesc: string
}


/**
 * Regex to match argument
 *
 * Example:
 *  '[pepper]'
 *  '<pepper>'
 *  '[...pepper]'
 *  '<...pepper>'
 */
export const argumentRegex = /^\s*([\[\<])\s*([.]{3})?([\w\-]+)\s*([\]\>])\s*$/


/**
 * Parse arg string to structured data
 *
 * Example:
 *
 *    parseArgument('[...pepper]') => { name: 'pepper', required: false, variadic: true }
 *    parseArgument('<pepper>') => { name: 'pepper', required: true, variadic: false }
 *    parseArgument('<pepper]') => null
 *    parseArgument('[]') => null
 *    parseArgument('<>') => null
 *
 * @param arg
 */
export function parseArgument(arg: string): Argument | null {
  const m = argumentRegex.exec(arg)
  if (m == null) return null

  const [, leftTag, variadic, name, rightTag] = m
  if (
    name.length < 0 ||
    (leftTag === '[' && rightTag !== ']') ||
    (leftTag === '<' && rightTag !== '>')
  ) {
    return null
  }

  const argDetail: Argument = {
    name,
    required:     leftTag === '<',
    variadic:     variadic != null,
    friendlyDesc: leftTag + (variadic || '') + name + rightTag,
  }
  return argDetail
}
