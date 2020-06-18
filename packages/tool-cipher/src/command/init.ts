import { CommanderStatic } from 'commander'
import fs from 'fs-extra'
import path from 'path'
import { Level } from '@barusu/chalk-logger'
import { convertToBoolean, isNotEmptyString } from '@barusu/option-util'
import { logger } from '../util/logger'
import { CipherMaster } from '../util/master'
import { flatDefaultOptions, handleError, parseOption } from './_util'


/**
 * load Sub-command: init
 */
export function loadSubCommandInit(
  name: string,
  program: CommanderStatic,
): void {
  program
    .command('init <directory>')
    .option('-S, --secret-filepath <secret filepath>', 'path of secret file')
    .option('--show-asterisk', 'whether to print password asterisks')
    .action(async function (workspace: string, options: any) {
      logger.setName(`${ name } init`)

      const cwd: string = workspace || path.resolve()
      const packageJsonPath = path.resolve(cwd, 'package.json')
      const defaultOptions = flatDefaultOptions({
        logLevel: undefined as any,
        secretFilepath: 'barusu.secret.txt',
        showAsterisk: true,
      }, packageJsonPath)

      // reset log-level
      const logLevel = parseOption<string>(options.logLevel, defaultOptions.logLevel)
      if (logLevel != null) {
        const level = Level.valueOf(logLevel)
        if (level != null) logger.setLevel(level)
      }

      // get secretFilepath
      const secretFilepath: string = path.resolve(cwd, parseOption<string>(
        options.secretFilepath, defaultOptions.secretFilepath, isNotEmptyString))

      // get showAsterisk
      const showAsterisk: boolean = parseOption<boolean>(
        convertToBoolean(options.showAsterisk), defaultOptions.showAsterisk)

      logger.debug('packageJsonPath:', packageJsonPath)
      logger.debug('secretFilepath:', secretFilepath)
      logger.debug('showAsterisk:', showAsterisk)

      // Secret file is existed
      if (fs.existsSync(secretFilepath)) {
        logger.error('secret file already exists.')
        process.exit(0)
      }

      try {
        const master = new CipherMaster({ showAsterisk })
        await master.createSecret(secretFilepath)
      } catch (error) {
        handleError(error)
      }
    })
}
