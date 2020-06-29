import fs from 'fs-extra'
import { isArray, isObject } from 'option-master'
import path from 'path'
import * as TJS from '@barusu/typescript-json-schema'
import { logger } from '../core/util/logger'
import { RestfulApiToolGeneratorContext } from './context'


/**
 * 生成 JSON-Schema 的工具类
 */
export class RestfulApiToolGenerator {
  protected readonly context: RestfulApiToolGeneratorContext

  public constructor(context: RestfulApiToolGeneratorContext) {
    this.context = context

    // debug logger
    logger.debug('[context] cwd:', context.cwd)
    logger.debug('[context] projectRootPath:', context.projectRootPath)
    logger.debug('[context] schemaRootPath:', context.schemaRootPath)
    logger.debug('[context] encoding:', context.encoding)
    logger.debug('[context] ignoreMissingModels:', context.ignoreMissingModels)
    logger.debug('[context] clean:', context.clean)
    logger.debug('[context] ignoredDataTypes:', context.ignoredDataTypes)
  }

  /**
   * 生成 schemas
   */
  public async generate(): Promise<void> {
    const { context } = this

    // 在生成 JSON-SCHEMA 前，做一些清理操作
    if (context.clean) {
      await this.clear()
    }

    // 生成 JSON-Schema
    const tasks: Promise<void>[] = []
    const doTask = (modelName: string, schemaPath: string): void => {
      const symbols = context.generator.getSymbols(modelName)
      if (symbols.length <= 0) {
        // 如果模型未找到且 ignoreMissingModels 为 true，则跳过
        if (context.ignoreMissingModels) {
          logger.info(`cannot find ${ modelName }. skipped.`)
          return
        }
        throw new Error(`${ modelName } not found.`)
      }

      // 若未指定 title，则模型名称作为 title
      const model: TJS.Definition = context.generator.getSchemaForSymbol(modelName)
      if (model.title == null) model.title = modelName

      // 确保输出路径上的文件夹已创建
      const dirname = path.dirname(schemaPath)
      if (!fs.existsSync(dirname)) fs.mkdirpSync(dirname)

      // 将 model 序列化
      const json = this.removeIgnoredDataTypes(model)
      const data = JSON.stringify(json, null, 2)
      const task = fs.writeFile(schemaPath, data, context.encoding)
        .then(() => logger.info(`output schema: [${ modelName }] ${ schemaPath }`))
      tasks.push(task)
    }

    for (const item of context.apiItems) {
      // RequestData
      if (item.request.model != null) {
        doTask(item.request.model, item.request.schema)
      }

      // ResponseData
      if (item.response.model != null) {
        doTask(item.response.model, item.response.schema)
      }
    }

    await Promise.all(tasks)
  }

  /**
   * 清空 JSON-SCHEMA 所在的目录
   */
  public async clear(): Promise<void> {
    const targetDirectory = this.context.schemaRootPath
    logger.info(`clearing schemas root path: ${ targetDirectory }.`)
    await fs.remove(targetDirectory)
  }

  /**
   * ignore undefined types
   * @param json
   */
  public removeIgnoredDataTypes<T extends any> (json: T): T | undefined {
    if (this.context.ignoredDataTypes.length <= 0) return json
    if (isArray(json)) {
      return json
        .map((d: any) => this.removeIgnoredDataTypes(d))
        .filter((d: any) => d !== undefined) as T
    }
    if (isObject(json)) {
      if (this.context.ignoredDataTypes.includes(json['type'])) return undefined
      const result: T = {} as T
      for (const key of Object.getOwnPropertyNames(json)) {
        const value = this.removeIgnoredDataTypes(json[key])
        if (value === undefined) continue
        result[key] = value
      }
      return result
    }
    return json
  }
}
