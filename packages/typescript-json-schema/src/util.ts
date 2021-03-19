import crypto from 'crypto'
import path from 'path'
import ts from 'typescript'
import { REGEX_REQUIRE } from './config'
import type { Definition, PrimitiveType } from './types'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function extend(target: any, ...args: any[]): any {
  if (target == null) {
    // TypeError if undefined or null
    throw new TypeError('Cannot convert undefined or null to object')
  }

  const to = Object(target)

  for (const nextSource of args) {
    if (nextSource != null) {
      // Skip over if undefined or null
      for (const nextKey in nextSource) {
        // Avoid bugs when hasOwnProperty is shadowed
        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
          to[nextKey] = nextSource[nextKey]
        }
      }
    }
  }
  return to
}

/**
 * 去重
 * @param arr
 */
export function unique<T>(arr: T[]): T[] {
  const set: Set<T> = new Set(arr)
  return [...set]
}

/**
 * 尝试将 value 作为 JSON 字符串解析；若解析失败，返回原字符串
 * @param value
 */
export function parseValue(
  symbol: ts.Symbol,
  key: string,
  value: string,
): any | string {
  const match = regexRequire(value)
  if (match) {
    const fileName = match[2].substr(1, match[2].length - 2).trim()
    const objectName = match[4]
    return resolveRequiredFile(symbol, key, fileName, objectName)
  }
  try {
    return JSON.parse(value)
  } catch (error) {
    return value
  }
}

/**
 * 提取字面量值
 * @param type
 */
export function extractLiteralValue(type: ts.Type): PrimitiveType | undefined {
  const { value = (type as any).text } = type as ts.LiteralType
  if (type.flags & ts.TypeFlags.StringLiteral) return value
  if (type.flags & ts.TypeFlags.BooleanLiteral)
    return (type as any).intrinsicName === 'true'
  if (type.flags & ts.TypeFlags.EnumLiteral) {
    const num = Number(value)
    return Number.isNaN(num) ? value : num
  }
  if (type.flags & ts.TypeFlags.NumberLiteral) return Number(value)
  return undefined
}

/**
 * convert map to object
 * @param m
 */
export function convertMapToObject<T>(m: Map<string, T>): Record<string, T> {
  return [...m.entries()].reduce((acc, [k, v]) => {
    // eslint-disable-next-line no-param-reassign
    acc[k] = v
    return acc
  }, {})
}

/**
 * checks whether a type is a tuple type.
 */
export function resolveTupleType(
  propertyType: ts.Type,
): ts.TupleTypeNode | null {
  if (
    !propertyType.getSymbol() &&
    propertyType.getFlags() & ts.TypeFlags.Object &&
    (propertyType as ts.ObjectType).objectFlags & ts.ObjectFlags.Reference
  )
    return (propertyType as ts.TypeReference).target as any

  if (
    !(
      propertyType.getFlags() & ts.TypeFlags.Object &&
      (propertyType as ts.ObjectType).objectFlags & ts.ObjectFlags.Tuple
    )
  )
    return null

  return propertyType as any
}

const simpleTypesAllowedProperties = {
  type: true,
  description: true,
}

function addSimpleType(def: Definition, type: string): boolean {
  for (const k in def) {
    if (!simpleTypesAllowedProperties[k]) return false
  }

  if (!def.type) {
    // eslint-disable-next-line no-param-reassign
    def.type = type
  } else if (typeof def.type !== 'string') {
    if (!def.type.every(val => typeof val === 'string')) return false
    if (!def.type.includes('null')) {
      def.type.push('null')
    }
  } else {
    if (typeof def.type !== 'string') {
      return false
    }

    if (def.type !== 'null') {
      // eslint-disable-next-line no-param-reassign
      def.type = [def.type, 'null']
    }
  }
  return true
}

export function makeNullable(def: Definition): Definition {
  if (!addSimpleType(def, 'null')) {
    const union = def.oneOf || def.anyOf
    if (union) {
      union.push({ type: 'null' })
    } else {
      const subDef = {}
      for (const k in def) {
        if (def.hasOwnProperty(k)) {
          subDef[k] = def[k]
          // eslint-disable-next-line no-param-reassign, @typescript-eslint/no-dynamic-delete
          delete def[k]
        }
      }
      // eslint-disable-next-line no-param-reassign
      def.anyOf = [subDef, { type: 'null' }]
    }
  }
  return def
}

/**
 * generate global unique name
 * @param node
 * @param relativePath
 */
export function generateHashOfNode(
  node: ts.Node,
  relativePath: string,
): string {
  return crypto
    .createHash('md5')
    .update(relativePath)
    .update(node.pos.toString())
    .digest('hex')
    .substring(0, 8)
}

export function normalizeFileName(filename: string): string {
  while (filename.substr(0, 2) === './') {
    // eslint-disable-next-line no-param-reassign
    filename = filename.substr(2)
  }
  return filename
}

/**
 * Given a Symbol, returns a canonical Definition. That can be either:
 * 1) The Symbol's valueDeclaration parameter if defined, or
 * 2) The sole entry in the Symbol's declarations array, provided that array
 *    has a length of 1.
 *
 * valueDeclaration is listed as a required parameter in the definition
 * of a Symbol, but I've experienced crashes when it's undefined at runtime,
 * which is the reason for this function's existence. Not sure if that's
 * a compiler API bug or what.
 */
export function getCanonicalDeclaration(sym: ts.Symbol): ts.Declaration {
  if (sym.valueDeclaration !== undefined) {
    return sym.valueDeclaration
  } else if (sym.declarations.length === 1) {
    return sym.declarations[0]
  }

  throw new Error(
    `Symbol "${sym.name}" has no valueDeclaration and ${sym.declarations.length} declarations.`,
  )
}

/**
 * Given a Symbol, finds the place it was declared and chases parent pointers
 * until we find a node where SyntaxKind === SourceFile.
 */
export function getSourceFile(sym: ts.Symbol): ts.SourceFile {
  let currentDecl: ts.Node = getCanonicalDeclaration(sym)

  while (currentDecl.kind !== ts.SyntaxKind.SourceFile) {
    if (currentDecl.parent === undefined) {
      throw new Error(
        `Unable to locate source file for declaration "${sym.name}".`,
      )
    }
    currentDecl = currentDecl.parent
  }

  return currentDecl as ts.SourceFile
}

/**
 *
 * @param symbol
 * @returns
 */
export function isFromDefaultLib(symbol: ts.Symbol): boolean {
  const declarations = symbol.getDeclarations()
  if (declarations && declarations.length > 0) {
    return declarations[0].parent.getSourceFile().hasNoDefaultLib
  }
  return false
}

/**
 * Resolve required file
 */
export function resolveRequiredFile(
  symbol: ts.Symbol,
  key: string,
  fileName: string,
  objectName: string,
): any {
  const sourceFile = getSourceFile(symbol)
  const requiredFilePath = /^[.\\/]+/.test(fileName)
    ? fileName === '.'
      ? path.resolve(sourceFile.fileName)
      : path.resolve(path.dirname(sourceFile.fileName), fileName)
    : fileName
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const requiredFile = require(requiredFilePath)
  if (!requiredFile) {
    throw Error("Required: File couldn't be loaded")
  }
  const requiredObject = objectName
    ? requiredFile[objectName]
    : requiredFile.default
  if (requiredObject === undefined) {
    throw Error('Required: Variable is undefined')
  }
  if (typeof requiredObject === 'function') {
    throw Error("Required: Can't use function as a variable")
  }
  if (key === 'examples' && !Array.isArray(requiredObject)) {
    throw Error("Required: Variable isn't an array")
  }
  return requiredObject
}

/**
 * @param value
 * @returns
 */
export function regexRequire(value: string): RegExpExecArray | null {
  return REGEX_REQUIRE.exec(value)
}
