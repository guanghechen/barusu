import ts from 'typescript'
import * as TJS from '@barusu/typescript-json-schema'
import {
  Command,
  ConfigFlatOpts,
  absoluteOfWorkspace,
  commander,
  relativeOfWorkspace,
  resolveCommandOptions,
} from '@barusu/util-cli'
import {
  cover,
  coverBoolean,
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


const __defaultCommandOptions: SubCommandOptions = {
  ...__defaultGlobalCommandOptions,
  apiConfigPath: [],
  tsconfigPath: 'tsconfig.json',
  schemaRootPath: '__data-schemas',
  encoding: 'utf-8',
  clean: false,
  muteMissingModel: false,
  ignoredDataTypes: [],
}


export type SubCommandGenerateOptions = SubCommandOptions & ConfigFlatOpts


/**
 * create Sub-command: generate
 */
export function createSubCommandGenerate(
  packageName: string,
  process?: (options: SubCommandGenerateOptions) => void | Promise<void>,
  commandName = 'generate',
  aliases: string[] = ['g'],
): commander.Command {
  const command = new Command()

  command
    .storeOptionsAsProperties(false)
    .passCommandToAction(false)
    .name(commandName)
    .aliases(aliases)
    .arguments('<workspace>')
    .option('-C, --api-config-path <api-config-path>', 'filepath of api-item config (glob patterns / strings)', (val, acc: string[]) => acc.concat(val), [])
    .option('-p, --tsconfig-path <tsconfigPath>', 'path of tsconfig.json')
    .option('-s, --schema-root-path <schemaRootPath>', 'root path of schema files')
    .option('-e, --encoding <encoding>', 'specify encoding of all files.')
    .option('--mute-missing-model', 'quiet when model not found')
    .option('--clean', 'clean schema folders before generate.')
    .action(async function ([_workspaceDir], options: SubCommandOptions) {
      logger.setName(commandName)

      const defaultOptions: SubCommandGenerateOptions = resolveCommandOptions<
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
      const encoding: string = coverString(
        defaultOptions.encoding, options.encoding, isNotEmptyString)
      logger.debug('encoding:', encoding)

      // resolve clean
      const clean: boolean = coverBoolean(defaultOptions.clean, options.clean)
      logger.debug('clean:', clean)

      // resolve muteMissingModel
      const muteMissingModel: boolean = coverBoolean(
        defaultOptions.muteMissingModel, options.muteMissingModel)
      logger.debug('muteMissingModel:', muteMissingModel)

      // resolve ignoredDataTypes
      const ignoredDataTypes: string[] = defaultOptions.ignoredDataTypes
      logger.debug('ignoredDataTypes:', ignoredDataTypes)

      // resolve additionalSchemaArgs
      const additionalSchemaArgs: TJS.PartialArgs | undefined =
        defaultOptions.additionalSchemaArgs
      logger.debug('additionalSchemaArgs:', additionalSchemaArgs)

      // resolve additionalCompilerOptions
      const additionalCompilerOptions: ts.CompilerOptions | undefined =
        defaultOptions.additionalCompilerOptions
      logger.debug('additionalCompilerOptions:', additionalCompilerOptions)
      const resolvedOptions: SubCommandGenerateOptions = {
        ...defaultOptions,
        tsconfigPath,
        schemaRootPath,
        apiConfigPath,
        encoding,
        clean,
        muteMissingModel,
        ignoredDataTypes,
        additionalSchemaArgs,
        additionalCompilerOptions,
      }

      if (process != null) {
        await process(resolvedOptions)
      }
    })

  return command
}
