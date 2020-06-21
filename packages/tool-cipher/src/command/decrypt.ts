import { CommanderStatic } from 'commander'
import path from 'path'
import { Level } from '@barusu/chalk-logger'
import {
  convertToBoolean,
  isNotEmptyArray,
  isNotEmptyString,
  parseOption,
} from '@barusu/option-util'
import { logger } from '../util/logger'
import { CipherMaster } from '../util/master'
import { createDefaultOptions, handleError } from './_util'


const SUB_COMMAND_NAME = 'decrypt'


/**
 * load Sub-command: encrypt
 */
export function loadSubCommandDecrypt(
  name: string,
  program: CommanderStatic,
): void {
  program
    .command(`${ SUB_COMMAND_NAME }`)
    .option('-S, --secret-filepath <secret filepath>', 'path of secret file')
    .option('-P, --plain-filepath-pattern <glob pattern>', 'glob pattern of files to be encrypted', (val, acc: string[]) => acc.concat(val), [])
    .option('-C, --cipher-filepath-pattern <glob pattern>', 'glob pattern of files have been encrypted', (val, acc: string[]) => acc.concat(val), [])
    .option('--show-asterisk', 'whether to print password asterisks')
    .action(async function (options: any) {
      logger.setName(`${ name } ${ SUB_COMMAND_NAME }`)

      const cwd: string = options.args[0] || path.resolve()
      const packageJsonPath = path.resolve(cwd, 'package.json')
      const defaultOptions = createDefaultOptions(packageJsonPath, SUB_COMMAND_NAME)

      // reset log-level
      const logLevel = parseOption<string>(defaultOptions.logLevel, options.logLevel)
      if (logLevel != null) {
        const level = Level.valueOf(logLevel)
        if (level != null) logger.setLevel(level)
      }

      // get secretFilepath
      const secretFilepath: string = path.resolve(cwd,
        parseOption<string>(
          defaultOptions.secretFilepath, options.secretFilepath, isNotEmptyString))

      // get indexFilepath
      const indexFilepath: string = path.resolve(cwd,
        parseOption<string>(
          defaultOptions.indexFilepath, options.indexFilepath, isNotEmptyString))

      // get showAsterisk
      const showAsterisk: boolean = parseOption<boolean>(
        defaultOptions.showAsterisk, convertToBoolean(options.showAsterisk))

      // get plainFilepathPatterns
      const plainFilepathPatterns: string[] = parseOption<string[]>(
        defaultOptions.plainFilepathPatterns, options.plainFilepathPattern, isNotEmptyArray)

      // get cipherFilepathPatterns
      const cipherFilepathPatterns: string[] = parseOption<string[]>(
        defaultOptions.cipherFilepathPatterns, options.cipherFilepathPattern, isNotEmptyArray)

      logger.debug('packageJsonPath:', packageJsonPath)
      logger.debug('secretFilepath:', secretFilepath)
      logger.debug('showAsterisk:', showAsterisk)
      logger.debug('plainFilepathPatterns:', plainFilepathPatterns)
      logger.debug('cipherFilepathPatterns:', cipherFilepathPatterns)

      try {
        const master = new CipherMaster({
          showAsterisk,
          secretFilepath,
        })
        const workspaceCatalog = master.loadIndex(indexFilepath)
        // await master.encryptFiles(plainFilepathPatterns)
      } catch (error) {
        handleError(error)
      }
    })
}
