/* eslint-disable @typescript-eslint/explicit-module-boundary-types */


/**
 * Test whether v is a string
 * @param v
 */
export function isString(v: string | any): v is string {
  return typeof v === 'string'
}


/**
 * Test whether v is a Non-empty string
 * @param v
 */
export function isNotEmptyString(v: string | any): v is string {
  return (typeof v === 'string') && v.length > 0
}


/**
 * Test whether v is an array
 * @param v*
 */
export function isArray(v: any[] | any): v is any[] {
  return Array.isArray(v)
}


/**
 * Test whether v is a Non-empty array
 * @param v*
 */
export function isNotEmptyArray(v: any[] | any): v is any[] {
  return Array.isArray(v) && v.length > 0
}
