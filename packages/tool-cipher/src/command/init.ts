import { CommanderStatic } from 'commander'
import fs from 'fs-extra'
import path from 'path'
import { Level } from '@barusu/chalk-logger'
import {
  convertToBoolean,
  convertToNumber,
  isNotEmptyString,
  parseOption,
} from '@barusu/option-util'
import { EventTypes, eventBus } from '../util/event-bus'
import { mkdirsIfNotExists } from '../util/fs'
import { logger } from '../util/logger'
import { CipherMaster } from '../util/master'
import { createDefaultOptions, handleError } from './_util'


const SUB_COMMAND_NAME = 'init'


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

      const workspaceDir: string = workspace || path.resolve()
      const packageJsonPath = path.resolve(workspaceDir, 'package.json')
      const defaultOptions = createDefaultOptions(packageJsonPath, SUB_COMMAND_NAME)

      // reset log-level
      const logLevel = parseOption<string>(defaultOptions.logLevel, options.logLevel)
      if (logLevel != null) {
        const level = Level.valueOf(logLevel)
        if (level != null) logger.setLevel(level)
      }

      // get secretFilepath
      const secretFilepath: string = path.resolve(workspaceDir, parseOption<string>(
        defaultOptions.secretFilepath, options.secretFilepath, isNotEmptyString))

      // get showAsterisk
      const showAsterisk: boolean = parseOption<boolean>(
        defaultOptions.showAsterisk, convertToBoolean(options.showAsterisk))

      // get miniumPasswordLength
      const miniumPasswordLength: number = parseOption<number>(
        defaultOptions.miniumPasswordLength, convertToNumber(options.miniumPasswordLength)
      )

      // ensure paths exist
      mkdirsIfNotExists(workspaceDir, true)
      mkdirsIfNotExists(secretFilepath, false)

      logger.debug('workspaceDir:', workspaceDir)
      logger.debug('packageJsonPath:', packageJsonPath)
      logger.debug('secretFilepath:', secretFilepath)
      logger.debug('showAsterisk:', showAsterisk)
      logger.debug('miniumPasswordLength:', miniumPasswordLength)

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
