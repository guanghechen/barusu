import ts from 'typescript'
import vm from 'vm'
import { JsonSchemaContext } from '../schema-context'
import { Definition } from '../types'
import { getTypeDefinition } from './type-definition'

/**
 *
 * @param context
 * @param prop
 * @param node
 */
export function getDefinitionForProperty(
  context: Readonly<JsonSchemaContext>,
  prop: ts.Symbol,
  node: ts.Node,
): Definition | null {
  if (prop.flags & ts.SymbolFlags.Method) return null

  const propertyName = prop.getName()
  const propertyType = context.checker.getTypeOfSymbolAtLocation(prop, node)
  const reffedType = context.getReferencedTypeSymbol(prop)
  const definition = getTypeDefinition(
    context,
    propertyType,
    undefined,
    undefined,
    prop,
    reffedType,
  )

  if (context.args.titles) definition.title = propertyName

  if (definition.hasOwnProperty('ignore')) return null

  // try to get default value
  const valDecl = prop.valueDeclaration as ts.VariableDeclaration
  if (valDecl?.initializer) {
    let initial = valDecl.initializer
    while (ts.isTypeAssertionExpression(initial)) {
      initial = initial.expression
    }

    if ((initial as any).expression) {
      // node
      console.warn(`initializer is expression for property ${propertyName}`)
    } else if (
      (initial as any).kind &&
      (initial as any).kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral
    ) {
      definition.default = initial.getText()
    } else {
      try {
        const sandbox = { sandboxvar: null as any }
        vm.runInNewContext(`sandboxvar=${initial.getText()}`, sandbox)
        const val = sandbox.sandboxvar
        if (
          val === null ||
          typeof val === 'string' ||
          typeof val === 'number' ||
          typeof val === 'boolean' ||
          Object.prototype.toString.call(val) === '[object Array]'
        ) {
          definition.default = val
        } else if (val) {
          console.warn(
            `unknown initializer for property ${propertyName}: ${val}`,
          )
        }
      } catch (e) {
        console.warn(
          `exception evaluating initializer for property ${propertyName}`,
        )
      }
    }
  }
  return definition
}
