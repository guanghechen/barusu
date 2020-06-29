import path from 'path'
import ts from 'typescript'
import * as TJS from '@barusu/typescript-json-schema'
import { ApiItemParser } from '../core/api-parser'
import { ApiItem } from '../core/types/api-item'
import {
  GenerateContextConfig,
  GlobalContextConfig,
} from '../core/types/context'
import { extractApiItemPath } from '../core/util/context-util'
import { ensureFilePathSync } from '../core/util/fs-util'
import { logger } from '../core/util/logger'
import { stringify } from '../core/util/type-util'


/**
 * 生成器的上下文信息
 *
 * @member cwd                  执行命令所在的目录
 * @member projectRootPath      待处理的目标工程路径（传进来的参数中，tsconfigPath 所在的目录）
 * @member schemaRootPath       生成的 Json-Schema 存放的文件夹（绝对路径）
 * @member encoding             目标工程的文件编码（简单起见，只考虑所有的源码使用同一种编码格式）；默认值为 utf-8
 * @member ignoreMissingModels  忽略未找到的模型
 * @member clean                是否清除 schemas 目录
 * @member apiItems             ApiItem 列表
 * @member ignoredDataTypes     忽略指定类型的数据模型
 * @member program              ts.Program: A Program is an immutable collection of 'SourceFile's and a 'CompilerOptions' that represent a compilation unit.
 * @member generator            Json-Schema 生成器
 */
export class RestfulApiToolGeneratorContext {
  public readonly cwd: string
  public readonly projectRootPath: string
  public readonly schemaRootPath: string
  public readonly encoding: string
  public readonly ignoreMissingModels: boolean
  public readonly clean: boolean
  public readonly apiItems: ApiItem[]
  public readonly ignoredDataTypes: string[]
  public readonly program: ts.Program
  public readonly generator: TJS.JsonSchemaGenerator

  public constructor(projectRootPath: string, options: GlobalContextConfig, params: GenerateContextConfig) {
    const {
      cwd,
      apiConfigPath: defaultApiConfigPath,
      schemaRootPath: defaultSchemaRootPath,
      encoding: defaultEncoding,
    } = options
    const {
      encoding = defaultEncoding,
      ignoredDataTypes = [],
      schemaArgs,
      additionalCompilerOptions,
      ignoreMissingModels,
      clean,
    } = params
    let {
      tsconfigPath,
      schemaRootPath = defaultSchemaRootPath,
      apiConfigPath = defaultApiConfigPath,
    } = params

    tsconfigPath = path.resolve(projectRootPath, tsconfigPath)
    schemaRootPath = path.resolve(projectRootPath, schemaRootPath)
    apiConfigPath = path.resolve(projectRootPath, apiConfigPath)

    // ensure tsconfigPath is valid.
    ensureFilePathSync(tsconfigPath)

    this.cwd = cwd
    this.projectRootPath = projectRootPath
    this.schemaRootPath = schemaRootPath
    this.ignoredDataTypes = ignoredDataTypes
    this.ignoreMissingModels = ignoreMissingModels
    this.encoding = encoding
    this.clean = clean

    const apiItemParser = new ApiItemParser(this.schemaRootPath)
    const apiConfigPaths: string[] = extractApiItemPath(apiConfigPath)
    for (const apiConfigPath of apiConfigPaths) {
      apiItemParser.scan(apiConfigPath)
    }

    this.apiItems = apiItemParser.collectAndFlat()
    if (this.apiItems.length <= 0) {
      logger.debug(`[RestfulApiToolGeneratorContext.constructor] option(${ stringify(options) }) params(${ stringify(params) }):`)
      throw new Error('no valid api item found.')
    }

    this.program = this.buildProgram(tsconfigPath, additionalCompilerOptions)
    this.generator = TJS.buildGenerator(this.program, schemaArgs)!

    if (this.generator == null) {
      logger.debug('[RestfulApiToolGeneratorContext.constructor] params:', params)
      throw new Error('failed to build jsonSchemaGenerator.')
    }
  }

  /**
   * create ts program instance
   * @param params
   */
  private buildProgram(tsconfigPath: string, additionalCompilerOptions: ts.CompilerOptions = {}) {
    const result = ts.parseConfigFileTextToJson(tsconfigPath, ts.sys.readFile(tsconfigPath)!)
    const configObject = result.config
    const configParseResult = ts.parseJsonConfigFileContent(
      configObject, ts.sys, path.dirname(tsconfigPath), additionalCompilerOptions, path.basename(tsconfigPath))

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { out, outDir, outFile, declaration, declarationDir, declarationMap, ...restOptions } = configParseResult.options
    restOptions.noEmit = true

    const program = ts.createProgram({
      rootNames: configParseResult.fileNames,
      options: restOptions,
      projectReferences: configParseResult.projectReferences
    })
    return program
  }
}
