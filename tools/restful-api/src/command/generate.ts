import { CommanderStatic } from 'commander'
import path from 'path'
import ts from 'typescript'
import { Level } from '@barusu/chalk-logger'
import * as TJS from '@barusu/typescript-json-schema'
import {
  ConfigFlatOpts,
  findPackageJsonPath,
  flagDefaultOptions,
  relativeOfWorkspace,
} from '@barusu/util-cli'
import {
  cover,
  coverBoolean,
  coverString,
  isNotEmptyString,
} from '@barusu/util-option'
import { generate } from '../core/generate'
import {
  GenerateCommandContext,
  createGenerateCommandContext,
} from '../core/generate/context'
import { logger } from '../index'
import { EventTypes, eventBus } from '../util/event-bus'
import {
  GlobalCommandOptions,
  defaultGlobalCommandOptions,
  handleError,
} from './_util'


const SUB_COMMAND_NAME = 'generate'
const SUB_COMMAND_NAME_ALIAS = 'g'


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
   * Clean schema folders before generate
   * @default false
   */
  clean: boolean
  /**
   * Ignore missing models
   * @default false
   */
  muteMissingModel: boolean
  /**
   *
   * @default []
   */
  ignoredDataTypes: string[]
  /**
   * Additional schema options
   */
  additionalSchemaArgs?: TJS.PartialArgs
  /**
   * Additional compiler options (identified with tsconfig.json#compilerOptions)
   */
  additionalCompilerOptions?: ts.CompilerOptions
}


const defaultCommandOptions: SubCommandOptions = {
  ...defaultGlobalCommandOptions,
  apiConfigPath: [],
  tsconfigPath: 'tsconfig.json',
  schemaRootPath: '__data-schemas',
  encoding: 'utf-8',
  clean: false,
  muteMissingModel: false,
  ignoredDataTypes: [],
}


/**
 * load Sub-command: generate
 */
export function loadSubCommandGenerate(
  name: string,
  program: CommanderStatic,
): void {
  program
    .command(`${ SUB_COMMAND_NAME } <directory>`)
    .alias(SUB_COMMAND_NAME_ALIAS)
    .option('-C, --api-config-path <api-config-path>', 'filepath of api-item config (glob patterns / strings)', (val, acc: string[]) => acc.concat(val), [])
    .option('-p, --tsconfig-path <tsconfigPath>', 'path of tsconfig.json')
    .option('-s, --schema-root-path <schemaRootPath>', 'root path of schema files')
    .option('-e, --encoding <encoding>', 'specify encoding of all files.')
    .option('--mute-missing-model', 'quiet when model not found')
    .option('--clean', 'clean schema folders before generate.')
    .action(async function (_workspaceDir: string, options: SubCommandOptions) {
      logger.setName(`${ name } ${ SUB_COMMAND_NAME }`)

      const cwd: string = path.resolve()
      const workspace: string = path.resolve(cwd, _workspaceDir)
      const configPath: string[] = options.configPath!.map((p: string) => path.resolve(workspace, p))
      const parasticConfigPath: string | null | undefined = cover<string | null>(
        (): string | null => findPackageJsonPath(workspace),
        options.parasticConfigPath)
      const parasticConfigEntry: string = coverString(name, options.parasticConfigEntry)
      const flatOpts: ConfigFlatOpts = {
        cwd,
        workspace,
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

      // get apConfigPath
      const apiConfigPath = cover<string[]>(
        defaultOptions.apiConfigPath, options.apiConfigPath, isNotEmptyString)
        .map((p: string) => relativeOfWorkspace(workspace, p))

      // get tsconfigPath
      const tsconfigPath = path.resolve(workspace, coverString(
        defaultOptions.tsconfigPath, options.tsconfigPath, isNotEmptyString))
      logger.debug('tsconfigPath:', tsconfigPath)

      // get schemaRootPath
      const schemaRootPath = path.resolve(workspace, coverString(
        defaultOptions.schemaRootPath, options.schemaRootPath, isNotEmptyString))
      logger.debug('schemaRootPath:', schemaRootPath)

      // get encoding
      const encoding = coverString(
        defaultOptions.encoding, options.encoding, isNotEmptyString)
      logger.debug('encoding:', encoding)

      // get muteMissingModel
      const muteMissingModel = coverBoolean(
        defaultOptions.muteMissingModel, options.muteMissingModel)
      logger.debug('muteMissingModel:', muteMissingModel)

      // get clean
      const clean = coverBoolean(defaultOptions.clean, options.clean)
      logger.debug('clean:', clean)

      // get ignoredDataTypes
      const ignoredDataTypes = defaultOptions.ignoredDataTypes
      logger.debug('ignoredDataTypes:', ignoredDataTypes)

      // get additionalSchemaArgs
      const additionalSchemaArgs = defaultOptions.additionalSchemaArgs
      logger.debug('additionalSchemaArgs:', additionalSchemaArgs)

      // get additionalCompilerOptions
      const additionalCompilerOptions = defaultOptions.additionalCompilerOptions
      logger.debug('additionalCompilerOptions:', additionalCompilerOptions)

      try {
        const context: GenerateCommandContext = await createGenerateCommandContext({
          cwd,
          workspace,
          tsconfigPath,
          schemaRootPath,
          apiConfigPath,
          encoding,
          clean,
          muteMissingModel,
          ignoredDataTypes,
          additionalSchemaArgs,
          additionalCompilerOptions,
        })

        await generate(context)
      } catch (error) {
        handleError(error)
      } finally {
        eventBus.dispatch({ type: EventTypes.EXITING })
      }
    })
}
