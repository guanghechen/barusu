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
 * 转换成数字
 *  - 若 @value 为 null/undefined，返回 undefined
 *  - 若 @value 为 string，先转为数字，若为 NaN，则视为 undefined，否则返回该数字
 *  - 若 @value 为 number，返回 @value
 *  - 否则，返回 undefined
 * @param value
 */
export function convertToNumber(value?: number | string | any): number | undefined {
  if (value == null) return undefined
  if (typeof value === 'string') {
    const v = Number(value)
    return Number.isNaN(v) ? undefined : v
  }
  if (typeof value === 'number') return value
  return undefined
}


/**
 * 转换成字符串
 *  - 若 @value 为 null/undefined，返回 undefined
 *  - 若 @value 为 string，返回 @value
 *  - 否则，返回 undefined
 * @param value
 */
export function convertToString(value?: string | any): string | undefined {
  if (value == null) return undefined
  if (typeof value === 'string') return value
  return undefined
}
