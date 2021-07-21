import { coverString } from '@guanghechen/option-helper'
import globby from 'globby'
import { logger } from '../../env/logger'
import type { ApiItemConfig } from '../../types/api-item'
import { ApiItemParser } from '../../util/api-parser'

/**
 * Context variables for RestfulApiServeContext
 */
export interface RestfulApiServeContext {
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
   * Base url of mock data files
   */
  readonly mockDataPrefixUrl: string
  /**
   * The root directory where the mock data files is located
   */
  readonly mockDataRootDir?: string
  /**
   * Base url of resource files
   */
  readonly mockResourcePrefixUrl: string
  /**
   * The root directory where the resource files is located
   */
  readonly mockResourceRootDir?: string
  /**
   * Api items
   */
  readonly apiItems: ApiItemConfig[]
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
   * Base url of mock data files
   */
  readonly mockDataPrefixUrl?: string
  /**
   * The root directory where the mock data files is located
   */
  readonly mockDataRootDir?: string
  /**
   * Base url of resource files
   */
  readonly mockResourcePrefixUrl?: string
  /**
   * The root directory where the resource files is located
   */
  readonly mockResourceRootDir?: string
}

/**
 * Create RestfulApiServeContext
 */
export async function createRestfulApiServeContext(
  params: Params,
): Promise<RestfulApiServeContext> {
  const apiItemParser = new ApiItemParser(params.schemaRootPath)
  const apiConfigPaths: string[] = await globby(params.apiConfigPath, {
    cwd: params.workspace,
  })
  for (const apiConfigPath of apiConfigPaths) {
    apiItemParser.scan(apiConfigPath)
  }

  const apiItems: ApiItemConfig[] = apiItemParser.collectAndFlat()
  if (apiItems.length <= 0) {
    logger.debug('createServeCommandContext params: {}', params)
    throw new Error('no valid api item found.')
  }

  const context: RestfulApiServeContext = {
    cwd: params.cwd,
    workspace: params.workspace,
    tsconfigPath: params.workspace,
    schemaRootPath: params.schemaRootPath,
    encoding: params.encoding,
    host: params.host,
    port: params.port,
    prefixUrl: params.prefixUrl,
    mockRequiredOnly: params.mockRequiredOnly,
    mockOptionalsAlways: params.mockOptionalsAlways,
    mockOptionalsProbability: params.mockOptionalsProbability,
    mockDataPrefixUrl: coverString(params.prefixUrl, params.mockDataPrefixUrl),
    mockDataRootDir: params.mockDataRootDir,
    mockResourcePrefixUrl: coverString(
      params.prefixUrl,
      params.mockResourcePrefixUrl,
    ),
    mockResourceRootDir: params.mockResourceRootDir,
    apiItems,
  }

  return context
}
