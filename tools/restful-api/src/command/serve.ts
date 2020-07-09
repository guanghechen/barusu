import { CommanderStatic } from 'commander'
import path from 'path'
import { Level } from '@barusu/chalk-logger'
import {
  ConfigFlatOpts,
  absoluteOfWorkspace,
  findPackageJsonPath,
  flagDefaultOptions,
  relativeOfWorkspace,
} from '@barusu/util-cli'
import {
  cover,
  coverBoolean,
  coverNumber,
  coverString,
  isNotEmptyString,
} from '@barusu/util-option'
import {
  RestfulApiServerContext,
  createRestfulApiServerContext,
} from '../core/serve/context'
import { RestfulApiServer } from '../core/serve/server'
import { logger } from '../index'
import { EventTypes, eventBus } from '../util/event-bus'
import {
  GlobalCommandOptions,
  defaultGlobalCommandOptions,
  handleError,
} from './_util'


const SUB_COMMAND_NAME = 'serve'
const SUB_COMMAND_NAME_ALIAS = 's'


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


const defaultCommandOptions: SubCommandOptions = {
  ...defaultGlobalCommandOptions,
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


/**
 * load Sub-command: serve
 */
export function loadSubCommandServe(
  name: string,
  program: CommanderStatic,
): void {
  program
    .command(`${ SUB_COMMAND_NAME } <directory>`)
    .alias(SUB_COMMAND_NAME_ALIAS)
    .action(async function (workspace: string, options: SubCommandOptions) {
      logger.setName(`${ name } ${ SUB_COMMAND_NAME }`)

      const cwd: string = path.resolve()
      const workspaceDir: string = path.resolve(cwd, workspace)
      const configPath: string[] = options.configPath!.map((p: string) => path.resolve(workspaceDir, p))
      const parasticConfigPath: string | null | undefined = cover<string | null>(
        (): string | null => findPackageJsonPath(workspaceDir),
        options.parasticConfigPath)
      const parasticConfigEntry: string = coverString(name, options.parasticConfigEntry)
      const flatOpts: ConfigFlatOpts = {
        cwd,
        workspace: workspaceDir,
        configPath,
        parasticConfigPath,
        parasticConfigEntry,
      }

      const defaultOptions = flagDefaultOptions(
        defaultCommandOptions,
        flatOpts,
        SUB_COMMAND_NAME,
        {},
      )

      // reset log-level
      const logLevel = cover<string | undefined>(defaultOptions.logLevel, options.logLevel)
      if (logLevel != null) {
        const level = Level.valueOf(logLevel)
        if (level != null) logger.setLevel(level)
      }

      logger.debug('cwd:', flatOpts.cwd)
      logger.debug('workspace:', flatOpts.workspace)
      logger.debug('configPath:', flatOpts.configPath)
      logger.debug('parasticConfigPath:', flatOpts.parasticConfigPath)
      logger.debug('parasticConfigEntry:', flatOpts.parasticConfigEntry)

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


      try {
        const context: RestfulApiServerContext = await createRestfulApiServerContext({
          cwd,
          workspace,
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
        })

        const server = new RestfulApiServer(context)
        server.start()
      } catch (error) {
        handleError(error)
      } finally {
        eventBus.dispatch({ type: EventTypes.EXITING })
      }
    })
}
