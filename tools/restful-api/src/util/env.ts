import fs from 'fs-extra'
import yaml from 'js-yaml'
import path from 'path'
import {
  ConfigurationMaster,
  DSchema,
  configurationMaster,
} from '@barusu/configuration-master'
import { ensureCriticalFilepathExistsSync } from '@barusu/util-cli'
import { logger } from './logger'


export const configRootDir = path.resolve(__dirname, '../config')
export const templateRootDir = path.join(configRootDir, 'templates')


/**
 * Calc absolute path of configs
 * @param filePath
 */
export function calcConfigFilePath (...filePath: string[]): string {
  return path.resolve(configRootDir, ...filePath)
}


/**
 * Load JSON-Schema of Configuration
 * @param configurationMaster
 * @param schemaName
 */
export function loadConfigSchema(configurationMaster: ConfigurationMaster, schemaName: string): any {
  const schemaPath: string = calcConfigFilePath(`${ schemaName }-schema.json`)
  const schemaContent = fs.readJSONSync(schemaPath)
  const schema = configurationMaster.parseJSON(schemaContent)
  return schema
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
export function loadContextConfig<R, T> (params: {
  configurationMaster: ConfigurationMaster,
  schema: DSchema,
  configPath: string,
  encoding: string,
  preprocess?: (json: any) => R,
  fallbackData?: any,
}): T | never {
  let json: R
  if (params.fallbackData == null) {
    ensureCriticalFilepathExistsSync(params.configPath, logger)
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
        json = yaml.safeLoad(content) as any
        break
      default:
        throw new Error(
          `Unsupported file format, filePath(${ params.configPath })`
          + ' should be a file in json or yaml format with a suffix of `.json` / `.yml` / `.yaml`')
    }
  } else {
    json = params.fallbackData!
  }

  // do preprocess
  if (params.preprocess != null) {
    json = params.preprocess(json)
  }

  // parse config
  const result = configurationMaster.validate(params.schema, json)
  if (result.hasError) {
    throw new Error(`Bad data of \`${ params.configPath }\` ${ result.errorSummary }`)
  }
  if (result.hasWarning) {
    logger.warn(`[loadContextConfig ${ params.configPath }]`, result.warningSummary)
  }
  return result.value
}
