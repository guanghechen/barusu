import crypto from 'crypto'
import ts from 'typescript'
import { PrimitiveType, Definition } from './types'


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
export function parseJson (value: string): any | string {
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
  if (type.flags & ts.TypeFlags.BooleanLiteral) return (type as any).intrinsicName === 'true'
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
export function convertMapToObject<T>(m: Map<string, T>): { [key: string]: T } {
  return [...m.entries()].reduce((acc, [k, v]) => {
    // eslint-disable-next-line no-param-reassign
    acc[k] = v
    return acc
  }, {})
}


/**
 * checks whether a type is a tuple type.
 */
export function resolveTupleType(propertyType: ts.Type): ts.TupleTypeNode | null {
  if (!propertyType.getSymbol() && (propertyType.getFlags() & ts.TypeFlags.Object && (propertyType as ts.ObjectType ).objectFlags & ts.ObjectFlags.Reference)) {
    return (propertyType as ts.TypeReference).target as any
  }
  if (!(propertyType.getFlags() & ts.TypeFlags.Object && (propertyType as ts.ObjectType).objectFlags & ts.ObjectFlags.Tuple)) {
    return null
  }
  return propertyType as any
}


const simpleTypesAllowedProperties = {
  type: true,
  description: true
}

function addSimpleType(def: Definition, type: string) {
  for (const k in def) {
    if (!simpleTypesAllowedProperties[k]) return false
  }

  if (!def.type) {
    // eslint-disable-next-line no-param-reassign
    def.type = type
  }
  else if (typeof def.type !== 'string') {
    if (!def.type.every(val => typeof val === 'string')) return false
    if (!def.type.includes('null')) {
      def.type.push('null')
    }
  }
  else {
    if (typeof def.type !== 'string') return false
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
          // eslint-disable-next-line no-param-reassign
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
export function generateHashOfNode(node: ts.Node, relativePath: string): string {
  return crypto.createHash('md5')
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
