import ts from 'typescript'
import { JsonSchemaContext } from '../schema-context'
import { Definition } from '../types'
import {
  extractLiteralValue,
  makeNullable,
  resolveTupleType,
  unique,
} from '../util'
import { getClassDefinition } from './class-definition'
import { parseCommentsIntoDefinition } from './comment-definition'
import { getEnumDefinition } from './enum-definition'
import { getIntersectionDefinition } from './intersection-definition'
import { getUnionDefinition } from './union-definition'


/**
 *
 * @param context
 * @param type
 * @param asRef
 * @param unionModifier
 * @param prop
 * @param reffedType
 * @param pairedSymbol
 */
export function getTypeDefinition(
  context: Readonly<JsonSchemaContext>,
  type: ts.Type,
  asRef: boolean = context.args.ref,
  unionModifier = 'anyOf',
  prop?: ts.Symbol,
  reffedType?: ts.Symbol,
  pairedSymbol?: ts.Symbol,
): Definition {
  // ignore any number of Readonly and Mutable type wrappings,
  // since they only add and remove readonly modifiers on fields
  // and JSON Schema is not concerned with mutability
  while (
    type.aliasSymbol
    && (type.aliasSymbol.escapedName === 'Readonly' || type.aliasSymbol.escapedName === 'Mutable')
    && type.aliasTypeArguments
    && type.aliasTypeArguments[0]
  ) {
    // eslint-disable-next-line no-param-reassign
    type = type.aliasTypeArguments[0]
    // eslint-disable-next-line no-param-reassign
    reffedType = undefined
  }

  const definition: Definition = {}
  const symbol = type.getSymbol()

  // function type
  if (
    context.args.typeOfKeyword
    && (type.flags & ts.TypeFlags.Object)
    && ((type as ts.ObjectType).objectFlags & ts.ObjectFlags.Anonymous)
  ) {
    definition.typeof = 'function'
    return definition
  }

  // FIXME: We can't just compare the name of the symbol - it ignores the namespace
  const isRawType = (
    !symbol
    || context.checker.getFullyQualifiedName(symbol) === 'Date'
    || symbol.name === 'integer'
    || context.checker.getIndexInfoOfType(type, ts.IndexKind.Number) !== undefined)

  // special case: an union where all child are string literals -> make an enum instead
  let isStringEnum = false
  if (type.flags & ts.TypeFlags.Union) {
    const unionType = type as ts.UnionType
    isStringEnum = unionType.types.every(propType => Boolean(propType.getFlags() & ts.TypeFlags.StringLiteral))
  }

  // aliased types must be handled slightly different
  const asTypeAliasRef = asRef && reffedType && (context.args.aliasRef || isStringEnum)
  if (!asTypeAliasRef) {
    // raw types and inline types cannot be reffed,
    // unless we are handling a type alias
    if (isRawType || (Boolean(type.getFlags() & ts.TypeFlags.Object) && Boolean((type as ts.ObjectType).objectFlags & ts.ObjectFlags.Anonymous))) {
      // eslint-disable-next-line no-param-reassign
      asRef = false
    }
  }

  let fullTypeName = ''
  if (asTypeAliasRef) {
    const symbol: ts.Symbol = Boolean(reffedType!.getFlags() & ts.SymbolFlags.Alias)
      ? context.checker.getAliasedSymbol(reffedType!)
      : reffedType!
    const fileNameOrSpace = new RegExp(context.REGEX_FILE_NAME_OR_SPACE, 'g')
    const qualifiedName = context.checker.getFullyQualifiedName(symbol).replace(fileNameOrSpace, '')
    fullTypeName = context.makeTypeNameUnique(type, qualifiedName)
  }
  else if (asRef) {
    fullTypeName = context.getTypeName(type)
  }


  // returned definition, may be a $ref
  const returnedDefinition = asRef
    // we don't return the full definition, but we put it into reffedDefinitions below.
    ? { $ref: `${ context.args.id }#/definitions/${ fullTypeName }` }
    : definition

  // parse comments
  // handle comments in the type alias declaration
  const otherAnnotations = {}
  parseCommentsIntoDefinition(context, reffedType, definition, otherAnnotations)
  parseCommentsIntoDefinition(context, symbol, definition, otherAnnotations)
  parseCommentsIntoDefinition(context, prop, returnedDefinition, otherAnnotations)

  // create the actual definition only if is an inline definition, or
  // if it will be a $ref and it is not yet created
  if (!asRef || !context.getReffedDefinition(fullTypeName)) {
    if (asRef) {  // must be here to prevent recursively problem
      if (context.args.titles && fullTypeName) {
        definition.title = fullTypeName
      }
      const reffedDefinition: Definition = (asTypeAliasRef && reffedType && type.symbol !== reffedType && symbol)
        ? getTypeDefinition(context, type, true, undefined, symbol, symbol)
        : definition
      context.setReffedDefinition(fullTypeName, reffedDefinition)
    }

    const node = symbol && symbol.getDeclarations() !== undefined ? symbol.getDeclarations()![0] : null
    // if users override the type, do not try to infer it
    // but the comments should always cover to reffed type
    if (definition.type === undefined) {
      const oldDescription = definition.description
      if (type.flags & ts.TypeFlags.Union) {
        Object.assign(definition, getUnionDefinition(context, type as ts.UnionType, prop!, unionModifier))
      }
      else if (type.flags & ts.TypeFlags.Intersection) {
        if (context.args.noExtraProps) {
          // extend object instead of using allOf because allOf does not work well with additional properties. See #107
          if (context.args.noExtraProps) {
            definition.additionalProperties = false
          }
          const { types } = type as ts.IntersectionType
          for (const member of types) {
            const other = getTypeDefinition(context, member, false)
            definition.type = other.type // should always be object
            definition.properties = { ...Object(definition.properties), ...Object(other.properties) }
            if (Object.keys(other.default || {}).length > 0) {
              definition.default = { ...Object(definition.default), ...Object(other.default) }
            }
            if (other.required) {
              definition.required = unique((definition.required || []).concat(other.required)).sort()
            }
          }
        }
        else {
          Object.assign(definition, getIntersectionDefinition(context, type as ts.IntersectionType))
        }
      }
      else if (isRawType) {
        if (pairedSymbol) {
          parseCommentsIntoDefinition(context, pairedSymbol, definition, {})
        }
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        Object.assign(definition, getDefinitionForRootType(context, type, reffedType!))
      }
      else if (node && (node.kind === ts.SyntaxKind.EnumDeclaration || node.kind === ts.SyntaxKind.EnumMember)) {
        Object.assign(definition, getEnumDefinition(context, type))
      }
      else if (
        symbol
        && Boolean(symbol.flags & ts.SymbolFlags.TypeLiteral)
        && symbol.members!.size === 0
        && !(node && (node.kind === ts.SyntaxKind.MappedType))
      ) {
        // {} is TypeLiteral with no members. Need special case because it doesn't have declarations.
        definition.type = 'object'
        definition.properties = {}
      }
      else {
        Object.assign(definition, getClassDefinition(context, type))
      }

      if (oldDescription != null && oldDescription.length > 0) {
        definition.description = oldDescription
      }
    }
  }

  if (otherAnnotations['nullable']) makeNullable(returnedDefinition)
  return returnedDefinition
}


export function getDefinitionForRootType(
  context: Readonly<JsonSchemaContext>,
  propertyType: ts.Type,
  reffedType: ts.Symbol,
): Definition {
  const { defaultNumberType } = context.args
  const tupleType = resolveTupleType(propertyType)
  const definition: Definition = {}
  if (tupleType) { // tuple
    const elemTypes: ts.NodeArray<ts.TypeNode> = tupleType.elementTypes || (propertyType as any).typeArguments
    const fixedTypes = elemTypes.map(elType => getTypeDefinition(context, elType as any))
    definition.type = 'array'
    definition.items = fixedTypes
    const { target: targetTupleType } = propertyType as ts.TupleTypeReference
    definition.minItems = targetTupleType.minLength
    if (targetTupleType.hasRestElement) {
      definition.additionalItems = fixedTypes[fixedTypes.length - 1]
      fixedTypes.splice(fixedTypes.length - 1, 1)
    }
    else {
      definition.additionalItems = {
        anyOf: fixedTypes
      }
    }
  }
  else {
    const { flags } = propertyType
    const propertyTypeString = context.checker.typeToString(propertyType, undefined, ts.TypeFormatFlags.UseFullyQualifiedType)
    const arrayType = context.checker.getIndexTypeOfType(propertyType, ts.IndexKind.Number)
    if (flags & ts.TypeFlags.String) {
      definition.type = 'string'
    }
    else if (flags & ts.TypeFlags.Number) {
      const isInteger = (definition.type === 'integer' || (reffedType && reffedType.getName() === 'integer')) || defaultNumberType === 'integer'
      definition.type = isInteger ? 'integer' : 'number'
    }
    else if (flags & ts.TypeFlags.Boolean) {
      definition.type = 'boolean'
    }
    else if (flags & ts.TypeFlags.Null) {
      definition.type = 'null'
    }
    else if (flags & ts.TypeFlags.Undefined) {
      definition.type = 'undefined'
    }
    else if ((flags & ts.TypeFlags.Any) || (flags & ts.TypeFlags.Unknown)) {
      // no type restriction, so that anything will match
    }
    else if (propertyTypeString === 'Date' && !context.args.rejectDateType) {
      definition.type = 'string'
      definition.format = 'date-time'
    }
    else if (propertyTypeString === 'object') {
      definition.type = 'object'
      definition.properties = {}
      definition.additionalProperties = true
    }
    else {
      const value = extractLiteralValue(propertyType)
      if (value !== undefined) {
        definition.type = typeof value
        definition.enum = [value]
      }
      else if (arrayType !== undefined) {
        if ((propertyType.flags & ts.TypeFlags.Object) &&
          ((propertyType as ts.ObjectType).objectFlags & (ts.ObjectFlags.Anonymous | ts.ObjectFlags.Interface | ts.ObjectFlags.Mapped))) {
          definition.type = 'object'
          definition.additionalProperties = false
          definition.patternProperties = {
            [context.NUMERIC_INDEX_PATTERN]: getTypeDefinition(context, arrayType)
          }
        }
        else {
          definition.type = 'array'
          definition.items = getTypeDefinition(context, arrayType)
        }
      }
      else {
        // Report that type could not be processed
        const error: any = new TypeError(`Unsupported type: ${ propertyTypeString }`)
        error.type = propertyType
        throw error
      }
    }
  }
  return definition
}
