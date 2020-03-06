import { convertToBoolean, convertToNumber, convertToString } from './convert'


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
export function coverBoolean(defaultValue: boolean, value?: any): boolean {
  const v = convertToBoolean(value)
  return cover<boolean>(defaultValue, v)
}


/**
 * 先将 @value 转成数字，然后调用 cover 函数
 * @param defaultValue
 * @param value
 */
export function coverNumber(defaultValue: number, value?: any): number {
  const v = convertToNumber(value)
  return cover<number>(defaultValue, v)
}


/**
 * If value isn't a string, return #defaultValue
 * @param defaultValue
 * @param value
 */
export function coverString(defaultValue: string, value?: string): string {
  const v = convertToString(value)
  return cover<string>(defaultValue, v)
}
