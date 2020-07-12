import {
  ConfigFlatOpts,
  absoluteOfWorkspace,
  relativeOfWorkspace,
  resolveCommandOptions,
} from '@barusu/util-cli'
import { commander } from '@barusu/util-cli'
import {
  cover,
  coverBoolean,
  coverNumber,
  coverString,
  isNotEmptyString,
} from '@barusu/util-option'
import { logger } from '../../util/logger'
import {
  GlobalCommandOptions,
  __defaultGlobalCommandOptions,
} from '../../util/option'


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
   * Path of tsconfig.json
   * @default tsconfig.json
   */
  tsconfigPath: string
  /**
   * Root path of schema files
   * @default __data-schemas
   */
  schemaRootPath: string
  /**
   * The encoding format of files in the working directory
   * @default 'utf-8'
   */
  encoding: string
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
  tsconfigPath: 'tsconfig.json',
  schemaRootPath: '__data-schemas',
  encoding: 'utf-8',
  host: 'localhost',
  port: 3000,
  prefixUrl: '',
  mockRequiredOnly: false,
  mockOptionalsAlways: false,
  mockDataFileRootPath: undefined,
  mockOptionalsProbability: 0.8,
  mockDataFileFirst: false,
}


export type SubCommandServeOptions = SubCommandOptions & ConfigFlatOpts


/**
 * create Sub-command: serve
 */
export function createSubCommandServe(
  packageName: string,
  process?: (options: SubCommandServeOptions) => void | Promise<void>,
  commandName = 'serve',
  aliases: string[] = ['s'],
): commander.Command {
  const command = new commander.Command()

  command
    .name(commandName)
    .aliases(aliases)
    .arguments('<workspace>')
    .action(async function ([_workspaceDir], options: SubCommandOptions) {
      logger.setName(commandName)
      const defaultOptions: SubCommandServeOptions = resolveCommandOptions<
        SubCommandOptions, SubCommandOptions>(
          logger, packageName, commandName,
          __defaultCommandOptions, _workspaceDir, options)
      const { workspace } = defaultOptions

      // resolve apConfigPath
      const apiConfigPath: string[] = cover<string[]>(
        defaultOptions.apiConfigPath, options.apiConfigPath, isNotEmptyString)
        .map((p: string): string => relativeOfWorkspace(workspace, p))
      logger.debug('apiConfigPath:', apiConfigPath)

      // resolve tsconfigPath
      const tsconfigPath: string = absoluteOfWorkspace(workspace, coverString(
        defaultOptions.tsconfigPath, options.tsconfigPath, isNotEmptyString))
      logger.debug('tsconfigPath:', tsconfigPath)

      // resolve schemaRootPath
      const schemaRootPath: string = absoluteOfWorkspace(workspace, coverString(
        defaultOptions.schemaRootPath, options.schemaRootPath, isNotEmptyString))
      logger.debug('schemaRootPath:', schemaRootPath)

      // resolve encoding
      const encoding = coverString(
        defaultOptions.encoding, options.encoding, isNotEmptyString)
      logger.debug('encoding:', encoding)

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
        tsconfigPath,
        schemaRootPath,
        apiConfigPath,
        encoding,
        host,
        port,
        prefixUrl,
        mockRequiredOnly,
        mockOptionalsAlways,
        mockOptionalsProbability,
        mockDataFileFirst,
        mockDataFileRootPath,
      }

      if (process != null) {
        await process(resolvedOptions)
      }
    })

  return command
}
