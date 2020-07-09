import { CommanderStatic } from 'commander'
import path from 'path'
import { Level } from '@barusu/chalk-logger'
import {
  ConfigFlatOpts,
  findPackageJsonPath,
  flagDefaultOptions,
} from '@barusu/util-cli'
import { cover, coverString, isNotEmptyString } from '@barusu/util-option'
import {
  RestfulApiInitializerContext,
  createRestfulApiInitializerContext,
} from '../core/init/context'
import { RestfulApiInitializer } from '../core/init/initializer'
import { logger } from '../index'
import { EventTypes, eventBus } from '../util/event-bus'
import {
  GlobalCommandOptions,
  defaultGlobalCommandOptions,
  handleError,
} from './_util'


const SUB_COMMAND_NAME = 'init'
const SUB_COMMAND_NAME_ALIAS = 'i'


interface SubCommandOptions extends GlobalCommandOptions {
  /**
   * Path of tsconfig.json
   * @default tsconfig.json
   */
  tsconfigPath: string
  /**
   * The encoding format of files in the working directory
   * @default 'utf-8'
   */
  encoding: string
}


const defaultCommandOptions: SubCommandOptions = {
  ...defaultGlobalCommandOptions,
  tsconfigPath: 'tsconfig.json',
  encoding: 'utf-8',
}


/**
 * load Sub-command: init
 */
export function loadSubCommandInit(
  name: string,
  program: CommanderStatic,
): void {
  program
    .command(`${ SUB_COMMAND_NAME } <directory>`)
    .alias(SUB_COMMAND_NAME_ALIAS)
    .option('-p, --tsconfig-path <tsconfigPath>', 'path of tsconfig.json (absolute or relative to the workspace)')
    .option('-e, --encoding <encoding>', 'specify encoding of all files.')
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

      // resolve tsconfig.json filepath
      const tsconfigPath: string = path.resolve(workspace, cover<string>(
        defaultOptions.tsconfigPath, options.tsconfigPath, isNotEmptyString))
      logger.debug('tsconfigPath:', tsconfigPath)

      // resolve encoding
      const encoding: string = cover<string>(
        defaultCommandOptions.encoding, options.encoding, isNotEmptyString)
      logger.debug('encoding:', encoding)

      try {
        const context: RestfulApiInitializerContext = createRestfulApiInitializerContext(
          { cwd, workspace, tsconfigPath, encoding })
        const initializer = new RestfulApiInitializer(context)
        await initializer.init()
      } catch (error) {
        handleError(error)
      } finally {
        eventBus.dispatch({ type: EventTypes.EXITING })
      }
    })
}
