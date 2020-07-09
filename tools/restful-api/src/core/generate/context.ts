import globby from 'globby'
import ts from 'typescript'
import * as TJS from '@barusu/typescript-json-schema'
import {
  cover,
  coverBoolean,
  coverString,
  isNotEmptyArray,
  isNotEmptyString,
} from '@barusu/util-option'
import { ApiItem } from '../../types/api-item'
import { ApiItemParser } from '../../util/api-parser'
import { logger } from '../../util/logger'


/**
 * Context variables for RestfulApiGenerator
 */
export interface RestfulApiGeneratorContext {
  /**
   * Path of currently executing command
   */
  readonly cwd: string
  /**
   * Working directory
   */
  readonly workspace: string
  /**
   * Path of tsconfig.json
   */
  readonly tsconfigPath: string
  /**
   * Output directory of generated data schemas
   */
  readonly schemaRootPath: string
  /**
   * The encoding format of files in the working directory
   */
  readonly encoding: string
  /**
   * Clean schema folders before generate
   */
  readonly clean: boolean
  /**
   * Be quiet when model not found
   */
  readonly muteMissingModel: boolean
  /**
   * Ignores the data model of the specified type
   */
  readonly ignoredDataTypes: string[]
  /**
   * Api items
   */
  readonly apiItems: ApiItem[]
  /**
   * ts.Program: A Program is an immutable collection of 'SourceFile's and a
   * 'CompilerOptions' that represent a compilation unit.
   */
  readonly program: ts.Program
  /**
   * JSON-Schema generator
   */
  readonly generator: TJS.JsonSchemaGenerator
}


interface Params {
  /**
 * Path of currently executing command
 */
  readonly cwd: string
  /**
   * Working directory
   */
  readonly workspace: string
  /**
   * Path of tsconfig.json
   */
  readonly tsconfigPath: string
  /**
   * Output directory of generated data schemas
   */
  readonly schemaRootPath: string
  /**
   * Filepath of api-item configs.
   *
   * Only *.yml, *.yaml and *.json are supported.
   * Each configuration file can specify the same options, the configuration
   * file specified later can override the configuration specified previous.
   * @default []
   */
  readonly apiConfigPath: string[]
  /**
   * The encoding format of files in the working directory
   * @default 'utf-8'
   */
  encoding?: string
  /**
   * Clean schema folders before generate
   * @default false
   */
  clean?: boolean
  /**
   * Be quiet when model not found
   * @default false
   */
  muteMissingModel?: boolean
  /**
   * Ignores the data model of the specified type
   * @default []
   */
  ignoredDataTypes?: string[]
  /**
   * Additional schema options
   */
  additionalSchemaArgs?: TJS.PartialArgs
  /**
   * Additional compiler options (identified with tsconfig.json#compilerOptions)
   */
  additionalCompilerOptions?: ts.CompilerOptions
}


/**
 * Create RestfulApiGeneratorContext
 */
export async function createRestfulApiGeneratorContext(
  params: Params
): Promise<RestfulApiGeneratorContext> {
  const apiItemParser = new ApiItemParser(params.schemaRootPath)
  const apiConfigPaths: string[] = await globby(params.apiConfigPath, { cwd: params.workspace })
  for (const apiConfigPath of apiConfigPaths) {
    apiItemParser.scan(apiConfigPath)
  }

  const apiItems: ApiItem[] = apiItemParser.collectAndFlat()
  if (apiItems.length <= 0) {
    logger.debug('createGenerateCommandContext params: {}', params)
    throw new Error('no valid api item found.')
  }

  const program: ts.Program = TJS.programFromConfig(
    params.tsconfigPath, undefined, params.additionalCompilerOptions)
  const generator: TJS.JsonSchemaGenerator = TJS.buildGenerator(
    program, params.additionalSchemaArgs)!

  if (generator == null) {
    logger.debug('createGenerateCommandContext params: {}', params)
    throw new Error('Failed to build JsonSchemaGenerator.')
  }

  const context: RestfulApiGeneratorContext = {
    cwd: params.cwd,
    workspace: params.workspace,
    tsconfigPath: params.workspace,
    schemaRootPath: params.schemaRootPath,
    encoding: coverString('utf-8', params.encoding, isNotEmptyString),
    muteMissingModel: coverBoolean(false, params.muteMissingModel),
    clean: coverBoolean(false, params.clean),
    ignoredDataTypes: cover<string[]>([], params.ignoredDataTypes, isNotEmptyArray),
    apiItems,
    program,
    generator,
  }

  return context
}
