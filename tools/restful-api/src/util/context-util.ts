import fs from 'fs-extra'
import yaml from 'js-yaml'
import { DSchema, OptionMaster, optionMaster } from 'option-master'
import path from 'path'
import { ensureCriticalFilepathExistsSync } from '@barusu/util-cli'
import { logger } from './logger'


/**
 * 计算配置文件的绝对路径
 * @param filePath    绝对路径或相对于配置文件根目录的路径
 */
export function calcConfigFilePath (...filePath: string[]): string {
  return path.resolve(__dirname, '../config', ...filePath)
}


/**
 * 加载配置的 JSON-Schema
 * @param optionMaster
 * @param schemaName
 */
export function loadConfigSchema(optionMaster: OptionMaster, schemaName: string): any {
  const schemaPath: string = calcConfigFilePath(`${ schemaName }.schema.json`)
  const schemaContent = fs.readJSONSync(schemaPath)
  const schema = optionMaster.parseJSON(schemaContent)
  return schema
}


/**
 * 加载配置文件
 * @param params
 *  - optionMaster
 *  - schema        配置文件的 DataSchema
 *  - configPath    配置文件的文件路径
 *  - encoding      配置文件的文件编码
 *  - preParse      对配置文件中的内容做预处理的函数
 */
export function loadContextConfig<R, T> (params: {
  optionMaster: OptionMaster,
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
  const result = optionMaster.validate(params.schema, json)
  if (result.hasError) {
    throw new Error(`Bad data of \`${ params.configPath }\` ${ result.errorSummary }`)
  }
  if (result.hasWarning) {
    logger.warn(`[loadContextConfig ${ params.configPath }]`, result.warningSummary)
  }
  return result.value
}
