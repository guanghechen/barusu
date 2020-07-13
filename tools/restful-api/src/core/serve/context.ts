import globby from 'globby'
import { coverBoolean, coverNumber, coverString } from '@barusu/util-option'
import { ApiItem } from '../../types/api-item'
import { ApiItemParser } from '../../util/api-parser'
import { logger } from '../../util/logger'


/**
 * Context variables for RestfulApiServerContext
 */
export interface RestfulApiServerContext {
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
   * Output directory of Served data schemas
   */
  readonly schemaRootPath: string
  /**
   * The encoding format of files in the working directory
   */
  readonly encoding: string
  /**
   * Server ip / domain
   */
  readonly host: string
  /**
   * The port on which the server is listening
   */
  readonly port: number
  /**
   * Routing prefix
   */
  readonly prefixUrl: string
  /**
   * Whether to return only the required attributes in JSON-Schema
   */
  readonly mockRequiredOnly: boolean
  /**
   * Whether all optional attributes are always returned
   */
  readonly mockOptionalsAlways: boolean
  /**
   * The probability that an optional attribute will be returned
   */
  readonly mockOptionalsProbability: number
  /**
   * Whether to prioritize using data files as mock data
   */
  readonly mockDataFileFirst: boolean
  /**
   * The root directory where the mock data file is located
   */
  readonly mockDataFileRootPath?: string
  /**
   * Api items
   */
  readonly apiItems: ApiItem[]
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
   * Output directory of Served data schemas
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
   * Server ip / domain
   * @default 'localhost'
   */
  host?: string
  /**
   * The port on which the server is listening
   * @default 3000
   */
  port?: number
  /**
   * Routing prefix
   */
  prefixUrl?: string
  /**
   * Whether to return only the required attributes in JSON-Schema
   * @default false
   */
  mockRequiredOnly?: boolean
  /**
   * Whether all optional attributes are always returned
   * @default false
   */
  mockOptionalsAlways?: boolean
  /**
   * The probability that an optional attribute will be returned
   * @default 0.8
   */
  mockOptionalsProbability?: number
  /**
   * Whether to prioritize using data files as mock data
   * @default false
   */
  mockDataFileFirst?: boolean
  /**
   * The root directory where the mock data file is located
   */
  mockDataFileRootPath?: string
}


/**
 * Create RestfulApiServerContext
 */
export async function createRestfulApiServerContext(
  params: Params
): Promise<RestfulApiServerContext> {
  const apiItemParser = new ApiItemParser(params.schemaRootPath)
  const apiConfigPaths: string[] = await globby(params.apiConfigPath, { cwd: params.workspace })
  for (const apiConfigPath of apiConfigPaths) {
    apiItemParser.scan(apiConfigPath)
  }

  const apiItems: ApiItem[] = apiItemParser.collectAndFlat()
  if (apiItems.length <= 0) {
    logger.debug('createServeCommandContext params: {}', params)
    throw new Error('no valid api item found.')
  }

  const context: RestfulApiServerContext = {
    cwd: params.cwd,
    workspace: params.workspace,
    tsconfigPath: params.workspace,
    schemaRootPath: params.schemaRootPath,
    encoding: coverString('utf-8', params.encoding),
    host: coverString('localhost', params.host),
    port: Number.parseInt(coverNumber(3000, params.port).toFixed(0)),
    prefixUrl: coverString('', params.prefixUrl),
    mockRequiredOnly: coverBoolean(false, params.mockRequiredOnly),
    mockOptionalsAlways: coverBoolean(false, params.mockOptionalsAlways),
    mockOptionalsProbability: coverNumber(0.8, params.mockOptionalsProbability),
    mockDataFileFirst: coverBoolean(false, params.mockDataFileFirst),
    mockDataFileRootPath: params.mockDataFileRootPath,
    apiItems,
  }

  return context
}
