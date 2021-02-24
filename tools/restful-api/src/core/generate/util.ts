import fs from 'fs-extra'
import { isArray, isObject } from '@barusu/util-option'
import { logger } from '../../env/logger'

/**
 * ignore undefined types
 * @param json
 */
export function removeIgnoredDataTypes<T extends unknown>(
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

/**
 * Clear root path of data schemas
 * @param schemaRootPath
 */
export async function clearSchemaRootPath(
  schemaRootPath: string,
): Promise<void> {
  const targetDirectory = schemaRootPath
  logger.info(`clearing schemas root path: ${targetDirectory}.`)
  await fs.remove(targetDirectory)
}
