import type ts from 'typescript'
import { subDefinitions } from '../config'
import type { JsonSchemaContext } from '../schema-context'
import { isFromDefaultLib, parseValue } from '../util'

/**
 * Parse the comments of a symbol into the definition and other annotations.
 *
 * @param context
 * @param symbol
 * @param definition
 * @param otherAnnotations
 */
export function parseCommentsIntoDefinition(
  context: Readonly<JsonSchemaContext>,
  symbol: ts.Symbol | undefined | null,
  definition: { description?: string },
  // eslint-disable-next-line @typescript-eslint/ban-types
  otherAnnotations: {},
): void {
  if (symbol == null) return

  // the comments for a symbol
  if (!isFromDefaultLib(symbol)) {
    const comments = symbol.getDocumentationComment(context.checker)
    if (comments.length > 0) {
      // eslint-disable-next-line no-param-reassign
      definition.description = comments
        .map(comment =>
          comment.kind === 'lineBreak'
            ? comment.text
            : comment.text
                .trim()
                .replace(new RegExp(context.REGEX_LINE_BREAK, 'g'), '\n'),
        )
        .join('')
    }
  }

  // jsdocs are separate from comments
  const jsDocs = symbol.getJsDocTags()
  const tjsDocRegex = new RegExp(context.REGEX_TJS_JSDOC)
  const groupJsDocRegex = new RegExp(context.REGEX_GROUP_JSDOC)
  for (const doc of jsDocs) {
    let [name, text]: [string, string] = [doc.name, doc.text || '']
    // In TypeScript versions prior to 3.7, it stops parsing the annotation
    // at the first non-alphanumeric character and puts the rest of the line as
    // the "text" of the annotation, so we have a little hack to check for the
    // name "TJS" and then we sort of re-parse the annotation to support prior
    // versions of TypeScript.
    if (name.startsWith('TJS-')) {
      name = name.slice(4)
      if (!text) {
        text = 'true'
      }
    } else if (name === 'TJS' && text.startsWith('-')) {
      const match: string[] | RegExpExecArray | null = tjsDocRegex.exec(
        doc.text!,
      )
      if (match) {
        name = match[1]
        text = match[2]
      } else {
        // Treat empty text as boolean true
        name = (text as string).replace(/^[\s-]+/, '')
        text = 'true'
      }
    }

    // In TypeScript ~3.5, the annotation name splits at the dot character
    // so we have to process the "." and beyond from the value
    if (subDefinitions[name]) {
      const match: string[] | RegExpExecArray | null = groupJsDocRegex.exec(
        text,
      )
      if (match) {
        const k = match[1]
        const v = match[2]
        // eslint-disable-next-line no-param-reassign
        definition[name] = {
          ...definition[name],
          [k]: v ? parseValue(symbol, k, v) : true,
        }
        continue
      }
    }

    // In TypeScript 3.7+, the "." is kept as part of the annotation name
    if (name.includes('.')) {
      const parts = name.split('.')
      if (parts.length === 2 && subDefinitions[parts[0]]) {
        // eslint-disable-next-line no-param-reassign
        definition[parts[0]] = {
          ...definition[parts[0]],
          [parts[1]]: text ? parseValue(symbol, name, text) : true,
        }
      }
    }

    if (
      context.validationKeywords[name] ||
      context.userValidationKeywords[name]
    ) {
      // eslint-disable-next-line no-param-reassign
      definition[name] =
        text === undefined ? '' : parseValue(symbol, name, text)
    } else {
      // special annotations
      // eslint-disable-next-line no-param-reassign
      otherAnnotations[doc.name] = true
    }
  }
}
