import { convertToBoolean, convertToNumber, convertToString } from './convert'
import { isFunction } from './is'

/**
 * 当 value 为 null/undefined 时，返回 @defaultValue
 * 否则返回 @value
 * @param defaultValue
 * @param value
 */
export function cover<T>(
  defaultValue: T | (() => T),
  value: T | null | undefined,
  isValueValid?: (t: T | null | undefined) => boolean,
): T {
  const valid = isValueValid != null ? isValueValid(value) : value != null
  if (!valid) {
    if (isFunction(defaultValue)) return defaultValue()
    return defaultValue
  }
  return value!
}

/**
 * 先将 @value 转成布尔值，然后调用 cover 函数
 * @param defaultValue
 * @param value
 */
export function coverBoolean(
  defaultValue: boolean | (() => boolean),
  value?: boolean | null | unknown,
  isValueValid?: (t: number | null | unknown) => boolean,
): boolean {
  const v = convertToBoolean(value)
  return cover<boolean>(defaultValue, v, isValueValid)
}

/**
 * 先将 @value 转成数字，然后调用 cover 函数
 * @param defaultValue
 * @param value
 */
export function coverNumber(
  defaultValue: number | (() => number),
  value?: number | null | unknown,
  isValueValid?: (t: number | null | unknown) => boolean,
): number {
  const v = convertToNumber(value)
  return cover<number>(defaultValue, v, isValueValid)
}

/**
 * If value isn't a string, return #defaultValue
 * @param defaultValue
 * @param value
 */
export function coverString(
  defaultValue: string | (() => string),
  value?: string | null | unknown,
  isValueValid?: (t: string | null | unknown) => boolean,
): string {
  const v = convertToString(value)
  return cover<string>(defaultValue, v, isValueValid)
}
