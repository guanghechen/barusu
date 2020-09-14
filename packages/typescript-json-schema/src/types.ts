import { JSONSchema7 } from 'json-schema'
import ts from 'typescript'


export type ObjectMap<T> = { [key: string]: T }


export interface SymbolRef {
  name: string
  typeName: string
  fullyQualifiedName: string
  symbol: ts.Symbol
}


export type RedefinedFields =
  | 'type'
  | 'items'
  | 'additionalItems'
  | 'contains'
  | 'properties'
  | 'patternProperties'
  | 'additionalProperties'
  | 'dependencies'
  | 'propertyNames'
  | 'if'
  | 'then'
  | 'else'
  | 'allOf'
  | 'anyOf'
  | 'oneOf'
  | 'not'
  | 'definitions'

export type DefinitionOrBoolean = Definition | boolean


// 基础类型
export type PrimitiveType = number | boolean | string | null


export interface Definition extends Omit<JSONSchema7, RedefinedFields> {
  // The type field here is incompatible with the standard definition
  type?: string | string[]

  // Non-standard fields
  propertyOrder?: string[]
  defaultProperties?: string[]
  typeof?: 'function'

  // Fields that must be redefined because they make use of this definition itself
  items?: DefinitionOrBoolean | DefinitionOrBoolean[]
  additionalItems?: DefinitionOrBoolean
  contains?: JSONSchema7
  properties?: {
    [key: string]: DefinitionOrBoolean
  }
  patternProperties?: {
    [key: string]: DefinitionOrBoolean
  }
  additionalProperties?: DefinitionOrBoolean
  dependencies?: {
    [key: string]: DefinitionOrBoolean | string[]
  }
  propertyNames?: DefinitionOrBoolean
  if?: DefinitionOrBoolean
  then?: DefinitionOrBoolean
  else?: DefinitionOrBoolean
  allOf?: DefinitionOrBoolean[]
  anyOf?: DefinitionOrBoolean[]
  oneOf?: DefinitionOrBoolean[]
  not?: DefinitionOrBoolean
  definitions?: {
    [key: string]: DefinitionOrBoolean
  }
}


export interface SchemaArgs {
  ref: boolean
  aliasRef: boolean
  topRef: boolean
  titles: boolean
  defaultProps: boolean
  noExtraProps: boolean
  propOrder: boolean
  typeOfKeyword: boolean
  required: boolean
  strictNullChecks: boolean
  ignoreErrors: boolean
  out: string
  validationKeywords: string[]
  include: string[]
  excludePrivate: boolean
  uniqueNames: boolean
  rejectDateType: boolean
  id: string
  defaultNumberType: 'number' | 'integer'
}


export type PartialArgs = Partial<SchemaArgs>


/**
 * 可以使用的
 */
export interface ValidationKeywords {
  [prop: string]: boolean
}
