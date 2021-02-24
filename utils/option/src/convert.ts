import { isBoolean, isNumber, isString } from './is'

/**
 * Convert to boolean
 *  - If v is null / undefined, return undefined
 *  - If v is string, only true/false is a valid value,
 *    other values are regarded as undefined
 *  - Otherwise, return Boolean(v)
 *
 * @param v
 */
export function convertToBoolean(
  v: string | boolean | unknown,
): boolean | undefined {
  if (v == null) return undefined
  if (isString(v)) {
    switch (v.toLowerCase()) {
      case 'false':
        return false
      case 'true':
        return true
    }
    return undefined
  }
  return Boolean(v)
}

/**
 * Convert to number
 *  - If v is null / undefined, return undefined
 *  - If v is string, it is converted to a number first, if it is NaN,
 *    it is regarded as undefined, otherwise the number is returned
 *  - If v is number, return v
 *  - Otherwise, return undefined
 *
 * @param v
 */
export function convertToNumber(
  v: number | string | unknown,
): number | undefined {
  if (v == null) return undefined
  if (isString(v)) {
    if (v.length <= 0) return undefined
    const x = Number(v)
    return Number.isNaN(x) ? undefined : x
  }
  if (isNumber(v)) return v
  return undefined
}

/**
 * Convert to string
 *  - If v is null/undefined or v.toString is null / undefined, return undefined
 *  - If v is a string / number / boolean, return v.toString()
 *  - Otherwise, return undefined
 *
 * @param v
 */
export function convertToString(v: string | unknown): string | undefined {
  if (v == null) return undefined
  if (isString(v) || isNumber(v) || isBoolean(v)) {
    return v.toString()
  }
  return undefined
}
