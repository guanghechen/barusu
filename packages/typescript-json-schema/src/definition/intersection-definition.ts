import ts from 'typescript'
import { JsonSchemaContext } from '../schema-context'
import { Definition } from '../types'
import { getTypeDefinition } from './type-definition'


/**
 * Get definition of intersect type (|)
 *
 * @param context
 * @param intersectionType
 * @param definition
 */
export function getIntersectionDefinition(
  context: Readonly<JsonSchemaContext>,
  intersectionType: ts.IntersectionType,
  definition: Definition,
): void {
  const schemas: Definition[] = []
  const simpleTypes: string[] = []

  const addSimpleType = (type: string) => {
    if (!simpleTypes.includes(type)) {
      simpleTypes.push(type)
    }
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
      } else {
        addSimpleType(def.type)
      }
    } else {
      schemas.push(def)
    }
  }

  if (simpleTypes.length > 0) {
    const type = simpleTypes.length === 1 ? simpleTypes[0] : simpleTypes
    schemas.push({ type })
  }

  if (schemas.length === 1) {
    for (const k in schemas[0]) {
      if (schemas[0].hasOwnProperty(k)) {
        // eslint-disable-next-line no-param-reassign
        definition[k] = schemas[0][k]
      }
    }
  } else {
    // eslint-disable-next-line no-param-reassign
    definition.allOf = schemas
  }
}
