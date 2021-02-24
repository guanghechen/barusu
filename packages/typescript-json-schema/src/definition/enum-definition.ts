import ts from 'typescript'
import { JsonSchemaContext } from '../schema-context'
import { Definition, PrimitiveType } from '../types'

/**
 * Get definition of enum type
 *
 * @param context
 * @param clazzType
 * @param definition
 */
export function getEnumDefinition(
  context: Readonly<JsonSchemaContext>,
  clazzType: ts.Type,
  definition: Definition,
): void {
  const node = clazzType.getSymbol()!.getDeclarations()![0]
  const fullName = context.checker.typeToString(
    clazzType,
    undefined,
    ts.TypeFormatFlags.UseFullyQualifiedType,
  )
  const members: ts.NodeArray<ts.EnumMember> =
    node.kind === ts.SyntaxKind.EnumDeclaration
      ? (node as ts.EnumDeclaration).members
      : ts.factory.createNodeArray([node as ts.EnumMember])

  const enumTypes: string[] = []
  const enumValues: PrimitiveType[] = []
  const addEnum = (type: string, value: PrimitiveType) => {
    enumValues.push(value)
    if (!enumTypes.includes(type)) {
      enumTypes.push(type)
    }
  }

  for (const member of members) {
    const caseLabel = (member.name as ts.Identifier).text
    const constantValue = context.checker.getConstantValue(member)
    if (constantValue !== undefined) {
      addEnum(typeof constantValue, constantValue)
      continue
    }

    const initial: ts.Expression | undefined = member.initializer
    if (initial == null) continue

    // try to extract the enums value it will probably by a cast expression
    if ((initial as any).expression) {
      const { expression: exp } = initial as any
      const { text } = exp
      // if it is an expression with a text literal, chances are it is the
      // enum conversion: CASELABEL = 'literal' as any
      if (text) {
        addEnum('string', text)
      } else if (
        exp.kind === ts.SyntaxKind.TrueKeyword ||
        exp.kind === ts.SyntaxKind.FalseKeyword
      ) {
        addEnum('boolean', exp.kind === ts.SyntaxKind.TrueKeyword)
      } else {
        console.warn(
          `initializer is expression for enum: ${fullName}.${caseLabel}`,
        )
      }
    } else if (initial.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral) {
      addEnum('string', initial.getText())
    } else if (initial.kind === ts.SyntaxKind.NullKeyword) {
      addEnum('null', null)
    }
  }

  if (enumTypes.length > 0) {
    // eslint-disable-next-line no-param-reassign
    definition.type = enumTypes.length === 1 ? enumTypes[0] : enumTypes
  }

  if (enumValues.length > 0) {
    // eslint-disable-next-line no-param-reassign
    definition.enum = enumValues.sort()
  }
}
