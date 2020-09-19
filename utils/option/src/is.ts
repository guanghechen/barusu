/**
 * Test whether v is a boolean / Boolean
 * @param v
 */
export function isUndefined(v: boolean | unknown): v is undefined {
  return typeof v === 'undefined'
}


/**
 * Test whether v is a boolean / Boolean
 * @param v
 */
export function isBoolean(v: boolean | unknown): v is boolean {
  return Object.prototype.toString.call(v) === '[object Boolean]'
}


/**
 * Test whether v is a number / Number
 * @param v
 */
export function isNumber(v: number | unknown): v is number {
  return Object.prototype.toString.call(v) === '[object Number]'
}


/**
 * Test whether v is a string / String
 * @param v
 */
export function isString(v: string | unknown): v is string {
  return Object.prototype.toString.call(v) === '[object String]'
}


/**
 * Test whether v is a bigint
 * @param v
 */
export function isBigint(v: symbol | unknown): v is bigint {
  return typeof v === 'bigint'
}

/**
 * Test whether v is a symbol
 * @param v
 */
export function isSymbol(v: symbol | unknown): v is symbol {
  return typeof v === 'symbol'
}


/**
 * Test whether v is a integer number
 * @param v
 */
export function isInteger(v: number | unknown): v is number {
  return isNumber(v) && Number.isInteger(Number(v))
}


/**
 * Test whether v is an array
 * @param v
 */
export function isArray(v: unknown[] | unknown): v is unknown[] {
  return Object.prototype.toString.call(v) === '[object Array]'
}


/**
 * Test whether v is an object
 * @param v
 */
export function isObject(v: unknown): v is Record<string, unknown> {
  return Object.prototype.toString.call(v) === '[object Object]'
}


/**
 * Test whether v is a function
 * @param v
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function isFunction(v: unknown): v is Function {
  return Object.prototype.toString.call(v) === '[object Function]'
}


/**
 * Test whether v is a primitive boolean
 * @param x
 */
export function isPrimitiveBoolean(x: boolean | unknown): x is boolean {
  return typeof x === 'boolean'
}


/**
 * Test whether v is a primitive number
 * @param x
 */
export function isPrimitiveNumber(x: number | unknown): x is number {
  return typeof x === 'number'
}


/**
 * Test whether v is a primitive integer number
 * @param v
 */
export function isPrimitiveInteger(v: number | unknown): v is number {
  return isPrimitiveNumber(v) && Number.isInteger(v)
}


/**
 * Test whether v is a primitive string
 * @param x
 */
export function isPrimitiveString(x: string | unknown): x is string {
  return typeof x === 'string'
}


/**
 * Test whether v is a Non-empty string
 * @param v
 */
export function isNotEmptyString(v: string | unknown): v is string {
  return isString(v) && v.length > 0
}


/**
 * Test whether v is a Non-empty array
 * @param v
 */
export function isNotEmptyArray(v: unknown[] | unknown): v is unknown[] {
  return isArray(v) && v.length > 0
}


/**
 * Test whether v is an empty object
 * @param v
 */
export function isEmptyObject(
  v: Record<string, unknown> | unknown
): v is Record<string, unknown> {
  return isObject(v) && Object.getOwnPropertyNames(v).length <= 0
}


/**
 * Test whether v is a non-empty object
 * @param v
 */
export function isNotEmptyObject(
  v: Record<string, unknown> | unknown
): v is Record<string, unknown> {
  return isObject(v) && Object.getOwnPropertyNames(v).length > 0
}


/**
 * Test whether v is a number or a string which content is a valid number
 * @param v
 */
export function isNumberLike(
  v: number | string | unknown
): v is (number | string) {
  if (isNumber(v)) return true
  return isNotEmptyString(v) && !Number.isNaN(Number(v))
}
