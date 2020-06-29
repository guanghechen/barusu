import ts from 'typescript'
import { JsonSchemaContext } from '../schema-context'
import { parseJson } from '../util'


/**
 * parse the comments of a symbol into the definition and other annotations.
 * @param symbol
 * @param definition
 * @param otherAnnotations
 */
export function parseCommentsIntoDefinition(
  context: Readonly<JsonSchemaContext>,
  symbol: ts.Symbol | undefined | null,
  definition: { description?: string },
  // eslint-disable-next-line @typescript-eslint/ban-types
  otherAnnotations: {}
): void {
  if (symbol == null) return

  // the comments for a symbol
  const comments = symbol.getDocumentationComment(context.checker)
  if (comments.length > 0) {
    // eslint-disable-next-line no-param-reassign
    definition.description = comments
      .map(comment => comment.kind === 'lineBreak'
        ? comment.text
        : comment.text.trim().replace(new RegExp(context.REGEX_LINE_BREAK, 'g'), '\n'))
      .join('')
  }

  // jsdocs are separate from comments
  const jsDocs = symbol.getJsDocTags()
  const tjsDocNameRegex = new RegExp(context.REGEX_TJS_JSDOC_NAME)
  const tjsDocContentRegex = new RegExp(context.REGEX_TJS_JSDOC_CONTENT, 'g')
  for (const doc of jsDocs) {
    let [name, text]: [string, string] = [doc.name, doc.text || '']

    // if we have @TJS-... annotations, we have to parse them
    const tjsDocNameMatch = tjsDocNameRegex.exec(name)
    if (tjsDocNameMatch != null) {
      if (tjsDocNameMatch[1] == null) {
        name = text.replace(/^[\s-]+/, '')
        text = 'true'
      } else {
        name = tjsDocNameMatch[1]
        const tjsDocContentMatch = tjsDocContentRegex.exec(text)
        text = tjsDocContentMatch == null ? 'true' : tjsDocContentMatch[1]
      }
    }
    if (context.validationKeywords[name] || context.userValidationKeywords[name]) {
      // eslint-disable-next-line no-param-reassign
      definition[name] = parseJson(text)
    } else {
      // eslint-disable-next-line no-param-reassign
      otherAnnotations[doc.name] = true
    }
  }
}
