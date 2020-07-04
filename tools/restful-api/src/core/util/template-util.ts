import fs from 'fs-extra'
import {
  toCamelCase,
  toConstantCase,
  toDotCase,
  toKebabCase,
  toLowerCase,
  toPascalCase,
  toPathCase,
  toSentenceCase,
  toSnakeCase,
  toTitleCase,
} from '@barusu/util-option'


export type TemplateData = { [key: string]: string }


/**
 * Replace placeholders in template-content with specified data
 *
 * @param content contents of the template
 * @param data    data used for rendering the template
 */
export function renderTemplate(content: string, data: TemplateData): string {
  const regex = /\{\{\s*(?:(camelCase|snakeCase|dashCase|kebabCase|dotCase|pathCase|properCase|pascalCase|lowerCase|sentenceCase|constantCase|titleCase)\s+)?([^\s\}]+?)\s*\}\}/gi
  return content.replace(regex, (matched: string, convert: string, key: string): string => {
    const val: string = data[key]
    if (val === undefined) return matched
    if (convert == null) return val
    switch (convert.toLowerCase()) {
      case 'camelcase': return toCamelCase(val)
      case 'snakecase': return toSnakeCase(val)
      case 'dashcase':
      case 'kebabcase': return toKebabCase(val)
      case 'dotcase': return toDotCase(val)
      case 'pathcase': return toPathCase(val)
      case 'propercase':
      case 'pascalcase': return toPascalCase(val)
      case 'lowercase': return toLowerCase(val)
      case 'sentencecase': return toSentenceCase(val)
      case 'constantcase': return toConstantCase(val)
      case 'titlecase': return toTitleCase(val)
      default: return matched
    }
  })
}


/**
 * render template file with specified data
 *
 * @param filePath  path of the template file
 * @param encoding  encoding of the template file
 * @param data      data used for rendering the template
 */
export async function renderTemplateFile(filePath: string, encoding: string, data: TemplateData): Promise<string> {
  const content: string = await fs.readFile(filePath, encoding)
  return renderTemplate(content, data)
}


/**
 * render template file with specified data and write to target file
 *
 * @param templateFilePath  path of the template file
 * @param encoding          encoding of the template file
 * @param data              data used for rendering the template
 * @param outputFilePath    path of the output file
 */
export async function renderTemplateFileAndOutput(
  templateFilePath: string,
  encoding: string,
  data: TemplateData,
  outputFilePath: string,
): Promise<void> {
  const content: string = await renderTemplateFile(templateFilePath, encoding, data)
  await fs.writeFile(outputFilePath, content, encoding)
}
