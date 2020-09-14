import {
  Command,
  CommandConfigurationFlatOpts,
  SubCommandCreator,
  SubCommandProcessor,
  absoluteOfWorkspace,
} from '@barusu/util-cli'
import {
  cover,
  coverBoolean,
  coverNumber,
  coverString,
  isNotEmptyArray,
  isNotEmptyString,
  isString,
} from '@barusu/util-option'
import { packageName } from '../../env/constant'
import { logger } from '../../env/logger'
import {
  GlobalCommandOptions,
  __defaultGlobalCommandOptions,
  resolveGlobalCommandOptions,
} from '../option'
import {
  RestfulApiServeContext,
  createRestfulApiServeContext,
} from './context'


interface SubCommandOptions extends GlobalCommandOptions {
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
   * Root path of schema files
   * @default __data-schemas
   */
  readonly schemaRootPath: string
  /**
   * Server ip / domain
   * @default 'localhost'
   */
  readonly host: string
  /**
   * The port on which the server is listening
   * @default 3000
   */
  readonly port: number
  /**
   * Routing prefix
   * @default
   */
  readonly prefixUrl: string
  /**
   * Whether to return only the required attributes in JSON-Schema
   * @default false
   */
  readonly mockRequiredOnly: boolean
  /**
   * Whether all optional attributes are always returned
   * @default false
   */
  readonly mockOptionalsAlways: boolean
  /**
   * The probability that an optional attribute will be returned
   * @default 0.8
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


const __defaultCommandOptions: SubCommandOptions = {
  ...__defaultGlobalCommandOptions,
  apiConfigPath:            [],
  schemaRootPath:           '__data-schemas',
  host:                     'localhost',
  port:                     3000,
  prefixUrl:                '',
  mockRequiredOnly:         false,
  mockOptionalsAlways:      false,
  mockOptionalsProbability: 0.8,
  mockDataPrefixUrl:        undefined,
  mockDataRootDir:          undefined,
  mockResourcePrefixUrl:    undefined,
  mockResourceRootDir:      undefined,
}


export type SubCommandServeOptions = SubCommandOptions & CommandConfigurationFlatOpts


/**
 * create Sub-command: serve
 */
export const createSubCommandServe: SubCommandCreator<SubCommandServeOptions> =
  function (
    handle?: SubCommandProcessor<SubCommandServeOptions>,
    commandName = 'serve',
    aliases: string[] = ['s'],
  ): Command {
    const command = new Command()

    command
      .name(commandName)
      .aliases(aliases)
      .arguments('<workspace>')
      .option('-C, --api-config-path <api-config-path>', 'filepath of api-item config (glob patterns / strings)', (val, acc: string[]) => acc.concat(val), [])
      .option('-s, --schema-root-path <schemaRootPath>', 'root path of schema files')
      .option('-h, --host <host>', 'specify the ip/domain address to which the mock-server listens.')
      .option('-p, --port <port>', 'specify the port on which the mock-server listens.')
      .option('--prefix-url <prefixUrl>', 'specify the prefix url of routes.')
      .option('--mock-required-only', 'json-schema-faker\'s option `requiredOnly`')
      .option('--mock-optionals-always', 'json-schema-faker\'s option `alwaysFakeOptionals`')
      .option('--mock-optionals-probability <optionalsProbability>', 'json-schema-faker\'s option `optionalsProbability`')
      .option('--mock-data-prefix-url <mockDataPrefixUrl>', 'base url of mock data files')
      .option('--mock-data-root-dir <mockDataRootDir>', 'specify the root dirpath of mock data files')
      .option('--mock-resource-prefix-url <mockResourcePrefixUrl>', 'base url of resource files')
      .option('--mock-resource-root-dir <mockResourceRootDir>', 'specify the root dirpath of resource files')
      .action(async function ([_workspaceDir], options: SubCommandOptions) {
        logger.setName(commandName)

        const defaultOptions: SubCommandServeOptions = resolveGlobalCommandOptions(
          packageName, commandName, __defaultCommandOptions, _workspaceDir, options)
        const { workspace } = defaultOptions

        // resolve apConfigPath
        const apiConfigPath: string[] = cover<string[]>(
          defaultOptions.apiConfigPath, options.apiConfigPath, isNotEmptyArray)
          .map((p: string): string => absoluteOfWorkspace(workspace, p))
        logger.debug('apiConfigPath:', apiConfigPath)

        // resolve schemaRootPath
        const schemaRootPath: string = absoluteOfWorkspace(workspace, coverString(
          defaultOptions.schemaRootPath, options.schemaRootPath, isNotEmptyString))
        logger.debug('schemaRootPath:', schemaRootPath)

        // resolve host
        const host: string = coverString(
          defaultOptions.host, options.host, isNotEmptyString)
        logger.debug('host:', host)

        // resolve port
        const port: number = coverNumber(defaultOptions.port, options.port)
        logger.debug('port:', port)

        // resolve prefixUrl
        const prefixUrl: string = coverString(
          defaultOptions.prefixUrl, options.prefixUrl, isNotEmptyString)
        logger.debug('prefixUrl:', prefixUrl)

        // resolve mockRequiredOnly
        const mockRequiredOnly: boolean = coverBoolean(
          defaultOptions.mockRequiredOnly, options.mockRequiredOnly)
        logger.debug('mockRequiredOnly:', mockRequiredOnly)

        // resolve mockOptionalsAlways
        const mockOptionalsAlways: boolean = coverBoolean(
          defaultOptions.mockOptionalsAlways, options.mockOptionalsAlways)
        logger.debug('mockOptionalsAlways:', mockOptionalsAlways)

        // resolve mockOptionalsProbability
        const mockOptionalsProbability: number = coverNumber(
          defaultOptions.mockOptionalsProbability, options.mockOptionalsProbability)
        logger.debug('mockOptionalsProbability:', mockOptionalsProbability)

        // resolve mockDataPrefixUrl
        const mockDataPrefixUrl: string | undefined = cover<string | undefined>(
          defaultOptions.mockDataPrefixUrl, options.mockDataPrefixUrl, isString)
        logger.debug('mockDataPrefixUrl:', mockDataPrefixUrl)

        // resolve mockDataRootDir
        const mockDataRootDir: string | undefined = absoluteOfWorkspace(workspace,
          cover<string | undefined>(defaultOptions.mockDataRootDir,
            options.mockDataRootDir, isNotEmptyString))
        logger.debug('mockDataRootDir:', mockDataRootDir)

        // resolve mockResourcePrefixUrl
        const mockResourcePrefixUrl: string | undefined = cover<string | undefined>(
          defaultOptions.mockResourcePrefixUrl, options.mockResourcePrefixUrl, isString)
        logger.debug('mockResourcePrefixUrl:', mockResourcePrefixUrl)

        // resolve mockResourceRootDir
        const mockResourceRootDir: string | undefined = absoluteOfWorkspace(workspace,
          cover<string | undefined>(defaultOptions.mockResourceRootDir,
            options.mockResourceRootDir, isNotEmptyString))
        logger.debug('mockResourceRootDir:', mockResourceRootDir)

        const resolvedOptions: SubCommandServeOptions = {
          ...defaultOptions,
          schemaRootPath,
          apiConfigPath,
          host,
          port,
          prefixUrl,
          mockRequiredOnly,
          mockOptionalsAlways,
          mockOptionalsProbability,
          mockDataPrefixUrl,
          mockDataRootDir,
          mockResourcePrefixUrl,
          mockResourceRootDir,
        }

        if (handle != null) {
          await handle(resolvedOptions)
        }
      })

    return command
  }


/**
 * Create RestfulApiServeContext
 * @param options
 */
export async function createRestfulApiServeContextFromOptions(
  options: SubCommandServeOptions,
): Promise<RestfulApiServeContext> {
  const context: RestfulApiServeContext = await createRestfulApiServeContext({
    cwd:                      options.cwd,
    workspace:                options.workspace,
    tsconfigPath:             options.tsconfigPath,
    schemaRootPath:           options.schemaRootPath,
    apiConfigPath:            options.apiConfigPath,
    encoding:                 options.encoding,
    host:                     options.host,
    port:                     options.port,
    prefixUrl:                options.prefixUrl,
    mockRequiredOnly:         options.mockRequiredOnly,
    mockOptionalsAlways:      options.mockOptionalsAlways,
    mockOptionalsProbability: options.mockOptionalsProbability,
    mockDataPrefixUrl:        options.mockDataPrefixUrl,
    mockDataRootDir:          options.mockDataRootDir,
    mockResourcePrefixUrl:    options.mockResourcePrefixUrl,
    mockResourceRootDir:      options.mockResourceRootDir,
  })
  return context
}
