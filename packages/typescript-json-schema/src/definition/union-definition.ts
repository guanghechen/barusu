import ts from 'typescript'
import { JsonSchemaContext } from '../schema-context'
import { Definition, PrimitiveType } from '../types'
import { extractLiteralValue } from '../util'
import { getTypeDefinition } from './type-definition'


/**
 * 获取联合类型的定义信息
 *
 * @param context
 * @param unionType
 * @param prop
 * @param unionModifier
 */
export function getUnionDefinition(
  context: Readonly<JsonSchemaContext>,
  unionType: ts.UnionType,
  prop: ts.Symbol,
  unionModifier: string,
): Definition {
  const enumValues: PrimitiveType[] = []
  const simpleTypes: string[] = []
  const schemas: Definition[] = []
  const addEnumValue = (value: PrimitiveType) => {
    if (!enumValues.includes(value)) enumValues.push(value)
  }
  const addSimpleType = (type: string) => {
    if (!simpleTypes.includes(type)) simpleTypes.push(type)
  }

  for (const valueType of unionType.types) {
    const value = extractLiteralValue(valueType)
    if (value !== undefined) {
      addEnumValue(value)
      continue
    }

    const def = getTypeDefinition(context, valueType)
    if (def.type === 'undefined') {
      // eslint-disable-next-line no-param-reassign
      if (prop) (prop as any).mayBeUndefined = true
      continue
    }

    const keys = Object.keys(def)
    if (keys.length === 1 && keys[0] === 'type') {
      if (typeof def.type !== 'string') {
        console.error('Expected only a simple type.')
      }
      else {
        addSimpleType(def.type)
      }
    } else {
      schemas.push(def)
    }
  }

  if (enumValues.length > 0) {
    // if the values are true and false, just add 'boolean' as simple type
    const isOnlyBooleans = enumValues.length === 2
      && typeof enumValues[0] === 'boolean'
      && typeof enumValues[1] === 'boolean'
      && enumValues[0] !== enumValues[1]
    if (isOnlyBooleans) {
      addSimpleType('boolean')
    }
    else {
      const enumSchema: Definition = { enum: enumValues.sort() }
      // if all values are of the same primitive type, add a 'type' field to the schema
      if (enumValues.every((x) => typeof x === 'string')) {
        enumSchema.type = 'string'
      }
      else if (enumValues.every((x) => typeof x === 'number')) {
        enumSchema.type = 'number'
      }
      else if (enumValues.every((x) => typeof x === 'boolean')) {
        enumSchema.type = 'boolean'
      }
      schemas.push(enumSchema)
    }
  }

  if (simpleTypes.length > 0) {
    const type = simpleTypes.length === 1 ? simpleTypes[0] : simpleTypes
    schemas.push({ type })
  }

  const definition: Definition = {}
  if (schemas.length === 1) {
    for (const k in schemas[0]) {
      // eslint-disable-next-line no-prototype-builtins
      if (schemas[0].hasOwnProperty(k)) {
        definition[k] = schemas[0][k]
      }
    }
  }
  else {
    definition[unionModifier] = schemas
  }
  return definition
}
