/**
 * 转换成布尔值
 *  - 若 @value 为 null/undefined，返回 undefined
 *  - 若 @value 为 string，则只有 true/false 才是有效值，其它值视为 undefined
 *  - 否则，返回 Boolean(@value)
 * @param value
 */
export function convertToBoolean(value?: string | boolean | any): boolean | undefined {
  if (value == null) return undefined
  if (typeof value === 'string') {
    switch (value.toLowerCase()) {
      case 'false': return false
      case 'true': return true
    }
    return undefined
  }
  return Boolean(value)
}


/**
 * 当 value 为 null/undefined 时，返回 @defaultValue
 * 否则返回 @value
 * @param defaultValue
 * @param value
 */
export function cover<T>(defaultValue: T, value: T | null | undefined): T {
  if (value == null) return defaultValue
  return value
}


/**
 * 先将 @value 转成布尔值，然后调用 cover 函数
 * @param defaultValue
 * @param value
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function coverBoolean(defaultValue: boolean, value?: any): boolean {
  const v = convertToBoolean(value)
  return cover<boolean>(defaultValue, v)
}
