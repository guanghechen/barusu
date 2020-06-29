import ts from 'typescript'
import { PrimitiveType, Definition } from '../types'
import { JsonSchemaContext } from '../schema-context'


/**
 * 获取枚举类型的定义信息
 * @member context
 * @member clazzType
 */
export function getEnumDefinition(context: Readonly<JsonSchemaContext>, clazzType: ts.Type): Definition {
  const node = clazzType.getSymbol()!.getDeclarations()![0]
  const fullName = context.checker.typeToString(clazzType, undefined, ts.TypeFormatFlags.UseFullyQualifiedType)
  const members: ts.NodeArray<ts.EnumMember> = node.kind === ts.SyntaxKind.EnumDeclaration
    ? (node as ts.EnumDeclaration).members
    : ts.createNodeArray([node as ts.EnumMember])

  const enumTypes: string[] = []
  const enumValues: PrimitiveType[] = []
  const addEnum = (type: string, value: PrimitiveType) => {
    enumValues.push(value)
    if (!enumTypes.includes(type)) enumTypes.push(type)
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
    if ((initial as any).expression != null) {
      const { expression: exp } = initial as any
      const { text } = exp
      // if it is an expression with a text literal, chances are it is the enum conversion:
      // CASELABEL = 'literal' as any
      if (text) {
        addEnum('string', text)
      }
      else if (exp.kind === ts.SyntaxKind.TrueKeyword || exp.kind === ts.SyntaxKind.FalseKeyword) {
        addEnum('boolean', Boolean(exp.kind === ts.SyntaxKind.TrueKeyword))
      }
      else {
        console.warn(`initializer is expression for enum: ${ fullName }.${ caseLabel }`)
      }
    }
    else if (initial.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral) {
      addEnum('string', initial.getText())
    }
    else if (initial.kind === ts.SyntaxKind.NullKeyword) {
      addEnum('null', null)
    }
  }

  const definition: Definition = {}
  if (enumTypes.length > 0) {
    definition.type = (enumTypes.length === 1) ? enumTypes[0] : enumTypes
  }
  if (enumValues.length > 0) {
    definition.enum = enumValues.sort()
  }
  return definition
}
