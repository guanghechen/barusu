import { isString } from 'option-master'


/**
 * check whether is a blank string.
 * @param x
 */
export function isNotBlankString(x: any): boolean {
  return isString(x) && x.length > 0
}


/**
 * 将对象内容转成字符串
 * @param x
 */
export function stringify (x: any) {
  if (x == null) return '' + x
  return JSON.stringify(x)
}
