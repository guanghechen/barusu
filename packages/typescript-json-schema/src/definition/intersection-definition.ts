import ts from 'typescript'
import { Definition } from '../types'
import { JsonSchemaContext } from '../schema-context'
import { getTypeDefinition } from './type-definition'


/**
 * 获取联合类型的定义信息
 * @param params
 */
export function getIntersectionDefinition(
  context: Readonly<JsonSchemaContext>,
  intersectionType: ts.IntersectionType
): Definition {
  const schemas: Definition[] = []
  const simpleTypes: string[] = []
  const addSimpleType = (type: string) => {
    if (!simpleTypes.includes(type)) simpleTypes.push(type)
  }

  for (const intersectionMember of intersectionType.types) {
    const def = getTypeDefinition(context, intersectionMember)
    if (def.type === 'undefined') {
      console.error('Undefined in intersection makes no sense.')
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
    }
    else {
      schemas.push(def)
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
  } else {
    definition.allOf = schemas
  }
  return definition
}
