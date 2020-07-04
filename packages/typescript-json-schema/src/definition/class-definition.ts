import ts from 'typescript'
import { JsonSchemaContext } from '../schema-context'
import { Definition } from '../types'
import { unique } from '../util'
import { parseCommentsIntoDefinition } from './comment-definition'
import { getDefinitionForProperty } from './property-definition'
import { getTypeDefinition } from './type-definition'


/**
 *
 * @param context
 * @param clazzType
 */
export function getClassDefinition(context: Readonly<JsonSchemaContext>, clazzType: ts.Type): Definition {
  const node = clazzType.getSymbol()!.getDeclarations()![0]
  const definition: Definition = {}

  if (context.args.typeOfKeyword && node.kind === ts.SyntaxKind.FunctionType) {
    definition.typeof = 'function'
    return definition
  }

  const clazz = node as ts.ClassDeclaration
  const props = context.checker.getPropertiesOfType(clazzType).filter(prop => {
    // filter never
    const propertyType = context.checker.getTypeOfSymbolAtLocation(prop, node)
    if (propertyType.getFlags() === ts.TypeFlags.Never) return false
    if (!context.args.excludePrivate) return true

    const decls = prop.declarations
    if (decls == null) return true
    return decls.filter(decl => {
      const mods = decl.modifiers
      return mods && mods.filter(mod => mod.kind === ts.SyntaxKind.PrivateKeyword).length > 0
    }).length <= 0
  })

  const fullName = context.checker.typeToString(clazzType, undefined, ts.TypeFormatFlags.UseFullyQualifiedType)
  const modifierFlags = ts.getCombinedModifierFlags(node)
  const inheritingTypes = context.inheritingTypes[fullName]
  if (Boolean(modifierFlags & ts.ModifierFlags.Abstract) && inheritingTypes != null) {
    const oneOf = inheritingTypes.map((typename) => {
      return getTypeDefinition(context, context.allSymbols[typename])
    })
    definition.oneOf = oneOf
  }
  else {
    if (clazz.members) {
      const indexSignatures = clazz.members == null ? [] : clazz.members.filter(x => x.kind === ts.SyntaxKind.IndexSignature)
      if (indexSignatures.length === 1) {
        // for case 'array-types'
        const indexSignature = indexSignatures[0] as ts.IndexSignatureDeclaration
        if (indexSignature.parameters.length !== 1) {
          throw new Error('Not supported: IndexSignatureDeclaration parameters.length != 1')
        }
        const indexSymbol: ts.Symbol = (indexSignature.parameters[0] as any).symbol
        const indexType = context.checker.getTypeOfSymbolAtLocation(indexSymbol, node)
        const isStringIndexed = (indexType.flags === ts.TypeFlags.String)
        if (indexType.flags !== ts.TypeFlags.Number && !isStringIndexed) {
          throw new Error('Not supported: IndexSignatureDeclaration with index symbol other than a number or a string')
        }
        const type = context.checker.getTypeAtLocation(indexSignature.type!)
        const def = getTypeDefinition(context, type, undefined, 'anyOf')
        if (isStringIndexed) {
          definition.type = 'object'
          definition.additionalProperties = def
        }
        else {
          definition.type = 'array'
          definition.items = def
        }
      }
    }
    const propertyDefinitions = props.reduce((all, prop) => {
      const propertyName = prop.getName()
      const propDef = getDefinitionForProperty(context, prop, node)
      if (propDef != null) {
        // eslint-disable-next-line no-param-reassign
        all[propertyName] = propDef
      }
      return all
    }, {})

    if (definition.type === undefined) {
      definition.type = 'object'
    }
    if (definition.type === 'object' && Object.keys(propertyDefinitions).length > 0) {
      definition.properties = propertyDefinitions
    }
    if (context.args.defaultProps) {
      definition.defaultProperties = []
    }
    if (context.args.noExtraProps && definition.additionalProperties === undefined) {
      definition.additionalProperties = false
    }
    if (context.args.propOrder) {
      // propertyOrder is non-standard, but useful:
      // https://github.com/json-schema/json-schema/issues/87
      const propertyOrder = props.reduce((order: string[], prop: ts.Symbol) => {
        order.push(prop.getName())
        return order
      }, [])
      definition.propertyOrder = propertyOrder
    }
    if (context.args.required) {
      const requiredProps = props.reduce((required: string[], prop: ts.Symbol) => {
        const def = {}
        parseCommentsIntoDefinition(context, prop, def, {})
        if (!(prop.flags & ts.SymbolFlags.Optional)
          && !(prop.flags & ts.SymbolFlags.Method)
          && !(prop as any).mayBeUndefined
          // eslint-disable-next-line no-prototype-builtins
          && !def.hasOwnProperty('ignore')) {
          required.push(prop.getName())
        }
        return required
      }, [])
      if (requiredProps.length > 0) {
        definition.required = unique<string>(requiredProps).sort()
      }
    }
  }

  return definition
}
