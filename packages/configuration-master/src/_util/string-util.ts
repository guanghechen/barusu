import * as changeCase from 'change-case'
import { lowerCase } from 'lower-case'
import { upperCase } from 'upper-case'


/**
 * 转成小写字母
 * @param s
 * @see https://github.com/blakeembrey/change-case#lowerCase
 */
export function toLowerCase(s: string): string {
  return lowerCase(s)
}


/**
 * 转成大写字母
 * @param s
 * @see https://github.com/blakeembrey/change-case#upperCase
 */
export function toUpperCase(s: string): string {
  return upperCase(s)
}


/**
 * 转为首字母大写式
 * @param s
 * @see https://github.com/blakeembrey/change-case#capitalCase
 */
export function toCapitalCase(s: string): string {
  return changeCase.capitalCase(s)
}


/**
 * 转为小写驼峰式(首字母小写)
 * @param s
 * @see https://github.com/blakeembrey/change-case#camelcase
 */
export function toCamelCase(s: string): string {
  return changeCase.camelCase(s)
}


/**
 * 转为大写驼峰式（首字母大写）
 * @param s
 * @see https://github.com/blakeembrey/change-case#pascalcase
 */
export function toPascalCase(s: string): string {
  return changeCase.pascalCase(s)
}


/**
 * 转为串式（中划线连接）
 * @param s
 * @see https://github.com/blakeembrey/change-case#paramcase
 */
export function toKebabCase(s: string): string {
  return changeCase.paramCase(s)
}


/**
 * 转为小写下划线连接式
 * @param s
 * @see https://github.com/blakeembrey/change-case#snakeCase
 */
export function toSnakeCase(s: string): string {
  return changeCase.snakeCase(s)
}


/**
 * 转为大写下划线连接式
 * @param s
 * @see https://github.com/blakeembrey/change-case#constantCase
 */
export function toConstantCase(s: string): string {
  return changeCase.constantCase(s)
}
