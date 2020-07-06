import { CommanderStatic } from 'commander'
import fs from 'fs-extra'
import path from 'path'
import { Level } from '@barusu/chalk-logger'
import {
  ConfigFlatOpts,
  findPackageJsonPath,
  flagDefaultOptions,
  mkdirsIfNotExists,
} from '@barusu/util-cli'
import {
  convertToBoolean,
  convertToNumber,
  cover,
  coverString,
  isNotEmptyString,
} from '@barusu/util-option'
import { EventTypes, eventBus } from '../util/event-bus'
import { logger } from '../util/logger'
import { CipherMaster } from '../util/master'
import {
  GlobalCommandOptions,
  defaultGlobalCommandOptions,
  handleError,
} from './_util'


const SUB_COMMAND_NAME = 'init'


interface SubCommandOptions extends GlobalCommandOptions {

}


const defaultCommandOptions: SubCommandOptions = {
  ...defaultGlobalCommandOptions,
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
    .option('-S, --secret-filepath <secret filepath>', 'path of secret file')
    .option('--show-asterisk', 'whether to print password asterisks')
    .option('--minimum-password-length', 'the minimum size required of password')
    .action(async function (workspace: string, options: any) {
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
      const logLevel = cover<string | undefined>(defaultOptions.logLevel, program.logLevel)
      if (logLevel != null) {
        const level = Level.valueOf(logLevel)
        if (level != null) logger.setLevel(level)
      }

      logger.debug('cwd:', flatOpts.cwd)
      logger.debug('workspace:', flatOpts.workspace)
      logger.debug('configPath:', flatOpts.configPath)
      logger.debug('parasticConfigPath:', flatOpts.parasticConfigPath)
      logger.debug('parasticConfigEntry:', flatOpts.parasticConfigEntry)

      // get secretFilepath
      const secretFilepath: string = path.resolve(workspaceDir, cover<string>(
        defaultOptions.secretFilepath, options.secretFilepath, isNotEmptyString))
      logger.debug('secretFilepath:', secretFilepath)

      // get showAsterisk
      const showAsterisk: boolean = cover<boolean>(
        defaultOptions.showAsterisk, convertToBoolean(options.showAsterisk))
      logger.debug('showAsterisk:', showAsterisk)

      // get miniumPasswordLength
      const miniumPasswordLength: number = cover<number>(
        defaultOptions.miniumPasswordLength, convertToNumber(options.miniumPasswordLength))
      logger.debug('miniumPasswordLength:', miniumPasswordLength)

      // ensure paths exist
      mkdirsIfNotExists(workspaceDir, true, logger)
      mkdirsIfNotExists(secretFilepath, false, logger)

      // Secret file is existed
      if (fs.existsSync(secretFilepath)) {
        logger.error('secret file already exists.')
        process.exit(0)
      }

      try {
        const master = new CipherMaster({
          workspaceDir,
          showAsterisk,
          secretFilepath,
          minimumSize: miniumPasswordLength,
        })
        await master.createSecret()
      } catch (error) {
        handleError(error)
      }
      eventBus.dispatch({ type: EventTypes.EXITING })
    })
}
