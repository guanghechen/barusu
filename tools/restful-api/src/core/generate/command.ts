import ts from 'typescript'
import * as TJS from '@barusu/typescript-json-schema'
import {
  Command,
  CommandConfigurationFlatOpts,
  absoluteOfWorkspace,
} from '@barusu/util-cli'
import {
  cover,
  coverBoolean,
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
  schemaRootPath: '__data-schemas',
  clean: false,
  muteMissingModel: false,
  ignoredDataTypes: [],
}


export type SubCommandGenerateOptions = SubCommandOptions & CommandConfigurationFlatOpts


/**
 * create Sub-command: generate
 */
export function createSubCommandGenerate(
  packageName: string,
  handle?: (options: SubCommandGenerateOptions) => void | Promise<void>,
  commandName = 'generate',
  aliases: string[] = ['g'],
): Command {
  const command = new Command()

  command
    .storeOptionsAsProperties(false)
    .passCommandToAction(false)
    .name(commandName)
    .aliases(aliases)
    .arguments('<workspace>')
    .option('-C, --api-config-path <api-config-path>', 'filepath of api-item config (glob patterns / strings)', (val, acc: string[]) => acc.concat(val), [])
    .option('-s, --schema-root-path <schemaRootPath>', 'root path of schema files')
    .option('--mute-missing-model', 'quiet when model not found')
    .option('--clean', 'clean schema folders before generate.')
    .action(async function ([_workspaceDir], options: SubCommandOptions) {
      logger.setName(commandName)

      const defaultOptions: SubCommandGenerateOptions = resolveGlobalCommandOptions(
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
        schemaRootPath,
        apiConfigPath,
        clean,
        muteMissingModel,
        ignoredDataTypes,
        additionalSchemaArgs,
        additionalCompilerOptions,
      }

      if (handle != null) {
        await handle(resolvedOptions)
      }
    })

  return command
}