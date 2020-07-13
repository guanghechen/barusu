import {
  Command,
  CommandConfigurationFlatOpts,
  absoluteOfWorkspace,
} from '@barusu/util-cli'
import {
  cover,
  coverBoolean,
  coverNumber,
  coverString,
  isNotEmptyArray,
  isNotEmptyString,
} from '@barusu/util-option'
import { logger } from '../../util/logger'
import {
  GlobalCommandOptions,
  __defaultGlobalCommandOptions,
  resolveGlobalCommandOptions,
} from '../option'


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
  schemaRootPath: string
  /**
   * Server ip / domain
   * @default 'localhost'
   */
  host: string
  /**
   * The port on which the server is listening
   * @default 3000
   */
  port: number
  /**
   * Routing prefix
   */
  prefixUrl: string
  /**
   * Whether to return only the required attributes in JSON-Schema
   * @default false
   */
  mockRequiredOnly: boolean
  /**
   * Whether all optional attributes are always returned
   * @default false
   */
  mockOptionalsAlways: boolean
  /**
   * The probability that an optional attribute will be returned
   * @default 0.8
   */
  mockOptionalsProbability: number
  /**
   * Whether to prioritize using data files as mock data
   * @default false
   */
  mockDataFileFirst: boolean
  /**
   * The root directory where the mock data file is located
   */
  mockDataFileRootPath?: string
}


const __defaultCommandOptions: SubCommandOptions = {
  ...__defaultGlobalCommandOptions,
  apiConfigPath: [],
  schemaRootPath: '__data-schemas',
  host: 'localhost',
  port: 3000,
  prefixUrl: '',
  mockRequiredOnly: false,
  mockOptionalsAlways: false,
  mockDataFileRootPath: undefined,
  mockOptionalsProbability: 0.8,
  mockDataFileFirst: false,
}


export type SubCommandServeOptions = SubCommandOptions & CommandConfigurationFlatOpts


/**
 * create Sub-command: serve
 */
export function createSubCommandServe(
  packageName: string,
  handle?: (options: SubCommandServeOptions) => void | Promise<void>,
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
    .option('--mock-use-data-file-first <mockDataFileRootPath>', 'specify the mock data file root path.')
    .option('--mock-data-file-first', 'preferred use data file as mock data source.')
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

      // resolve mockOptionalsAlways
      const mockDataFileFirst: boolean = coverBoolean(
        defaultOptions.mockDataFileFirst, options.mockDataFileFirst)
      logger.debug('mockDataFileFirst:', mockDataFileFirst)

      // resolve mockDataFileRootPath
      const mockDataFileRootPath: string | undefined = absoluteOfWorkspace(workspace,
        cover<string | undefined>(defaultOptions.mockDataFileRootPath,
          options.mockDataFileRootPath, isNotEmptyString))
      logger.debug('mockDataFileRootPath:', mockDataFileRootPath)

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
        mockDataFileFirst,
        mockDataFileRootPath,
      }

      if (handle != null) {
        await handle(resolvedOptions)
      }
    })

  return command
}
