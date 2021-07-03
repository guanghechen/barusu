import { ensureCriticalFilepathExistsSync } from '@guanghechen/file-helper'
import type { ValidateFunction } from 'ajv'
import Ajv from 'ajv'
import fs from 'fs-extra'
import yaml from 'js-yaml'
import path from 'path'
import { configRootDir } from './constant'

/**
 * Calc absolute path of configs
 * @param filePath
 */
export function calcConfigFilePath(...filePath: string[]): string {
  return path.resolve(configRootDir, ...filePath)
}

/**
 * Load JSON-Schema of Configuration
 * @param configurationMaster
 * @param schemaName
 */
export function loadConfigValidator<T extends unknown>(
  schemaName: string,
): ValidateFunction<T> {
  const filepath: string = calcConfigFilePath(`${schemaName}-schema.json`)
  const schema = fs.readJSONSync(filepath)
  const ajv = new Ajv()
  const validator = ajv.compile<T>(schema)
  return validator
}

/**
 * Load config
 *
 * @param params
 *  - configurationMaster
 *  - schema        Schema of configuration
 *  - configPath    filepath of config
 *  - encoding      encoding of config file
 *  - preParse      preprocessor of config file
 */
export function loadContextConfig<R, T>(params: {
  validate: ValidateFunction
  configPath: string
  encoding: BufferEncoding
  preprocess?(json: any): R
  fallbackData?: any
}): T | never {
  let json: R
  if (params.fallbackData == null) {
    ensureCriticalFilepathExistsSync(params.configPath)
  }

  if (params.fallbackData == null || fs.existsSync(params.configPath)) {
    const content: string = fs.readFileSync(params.configPath, params.encoding)

    // parse data
    switch (path.extname(params.configPath)) {
      case '.json':
        json = JSON.parse(content)
        break
      case '.yml':
      case '.yaml':
        json = yaml.load(content) as any
        break
      default:
        throw new Error(
          `Unsupported file format, filePath(${params.configPath})` +
            ' should be a file in json or yaml format with a suffix of `.json` / `.yml` / `.yaml`',
        )
    }
  } else {
    json = params.fallbackData!
  }

  // do preprocess
  if (params.preprocess != null) {
    json = params.preprocess(json)
  }

  // parse config
  const valid = params.validate(json)
  if (!valid) {
    const message =
      'Bad data of `' +
      params.configPath +
      ':[\n' +
      JSON.stringify(params.validate.errors, null, 2)
    throw new Error(message)
  }
  return json as unknown as T
}
