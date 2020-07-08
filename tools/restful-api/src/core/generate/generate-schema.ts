import fs from 'fs-extra'
import * as TJS from '@barusu/typescript-json-schema'
import { mkdirsIfNotExists } from '@barusu/util-cli'
import { isArray, isObject } from '@barusu/util-option'
import { logger } from '../../util/logger'
import { GenerateCommandContext } from './context'


export async function generateDataSchema(
  context: GenerateCommandContext,
  modelName: string,
  schemaPath: string,
): Promise<void> {
  const symbols = context.generator.getSymbols(modelName)
  if (symbols.length <= 0) {
    // If the model is not found and muteMissingModel are set to true, skipped
    if (context.muteMissingModel) {
      logger.info(`cannot find ${ modelName }. skipped.`)
      return
    }
    throw new Error(`${ modelName } not found.`)
  }

  // If no title is specified, the model name is the title
  const model: TJS.Definition = context.generator.getSchemaForSymbol(modelName)
  if (model.title == null) model.title = modelName

  // Make sure the folder on the output path has been created
  mkdirsIfNotExists(schemaPath, false)

  // Serialize the Model
  const json = removeIgnoredDataTypes(model, context.ignoredDataTypes)
  const data = JSON.stringify(json, null, 2)

  await fs.writeFile(schemaPath, data, context.encoding)
  logger.info(`output schema: [${ modelName }] ${ schemaPath }`)
}


/**
 * ignore undefined types
 * @param json
 */
function removeIgnoredDataTypes<T extends unknown>(
  json: T,
  ignoredDataTypes: string[],
): T | undefined {
  if (ignoredDataTypes.length <= 0) return json
  if (isArray(json)) {
    return json
      .map((d: any) => removeIgnoredDataTypes(d, ignoredDataTypes))
      .filter((d: any) => d !== undefined) as T
  }
  if (isObject(json)) {
    if (ignoredDataTypes.includes(json['type'] as string)) return undefined
    const result: T = {} as T
    for (const key of Object.getOwnPropertyNames(json)) {
      const value = removeIgnoredDataTypes(json[key], ignoredDataTypes)
      if (value === undefined) continue
      result[key] = value
    }
    return result
  }
  return json
}
