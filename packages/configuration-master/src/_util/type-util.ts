/**
 * 判断是否为数字
 * @param x
 */
export function isNumber(x: any): x is number {
  return Object.prototype.toString.call(x) === '[object Number]'
}


/**
 * 判断是否为字符串
 * @param x
 */
export function isString(x: any): x is string {
  return Object.prototype.toString.call(x) === '[object String]'
}


/**
 * 判断是否为数字或内容为有效数字的字符串
 * @param x
 */
export function isNumberLike(x: any): x is (number | string) {
  if (typeof x === 'number') return true
  return isString(x) && !Number.isNaN(Number(x))
}


/**
 * 判断是否为整数类型的数据
 * @param x
 */
export function isInteger(x: any): x is number {
  return isNumber(x) && Number.isInteger(x)
}


/**
 * 判断是否为布尔类型的数据
 * @param x
 */
export function isBoolean(x: any): x is boolean {
  return typeof x === 'boolean'
}


/**
 * 判断是否为数组
 * @param x
 */
export function isArray(x: any): x is any[] {
  return Array.isArray(x)
}

/**
 * 判断是否为对象；
 * array is not an object
 * @param x
 */
export function isObject(x: any): x is Record<string, unknown> {
  return x != null && typeof x === 'object' && !Array.isArray(x)
}


/**
 * 判断是否为空对象
 * @param x
 */
export function isEmptyObject(x: any): x is Record<string, unknown> {
  return isObject(x) && Object.getOwnPropertyNames(x).length <= 0
}


/**
 * 判断是否为非空对象
 * @param x
 */
export function isNotEmptyObject(x: any): x is Record<string, unknown> {
  return isObject(x) && Object.getOwnPropertyNames(x).length > 0
}


/**
 * 将字符串转为数字，要求整个字符串的内容为合法的数字，否则返回 NaN
 * @param x
 */
export function convertToNumber(x: string | number): number {
  return Number(x)
}


/**
 * 将对象内容转成字符串
 * @param x
 */
export function stringify(x: any) {
  if (x == null) return '' + x
  return JSON.stringify(x)
}
