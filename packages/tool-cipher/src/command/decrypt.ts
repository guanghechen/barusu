import { CommanderStatic } from 'commander'
import path from 'path'
import { Level } from '@barusu/chalk-logger'
import {
  convertToBoolean,
  isNotEmptyArray,
  isNotEmptyString,
} from '@barusu/option-util'
import { logger } from '../util/logger'
import { CipherMaster } from '../util/master'
import { createDefaultOptions, handleError, parseOption } from './_util'


/**
 * load Sub-command: encrypt
 */
export function loadSubCommandEncrypt(
  name: string,
  program: CommanderStatic,
): void {
  // Sub-command: encrypt
  program
    .command('encrypt')
    .option('-S, --secret-filepath <secret filepath>', 'path of secret file')
    .option('-P, --plain-filepath-pattern <glob pattern>', 'glob pattern of files to be encrypted', (val, acc: string[]) => acc.concat(val), [])
    .option('-C, --cipher-filepath-pattern <glob pattern>', 'glob pattern of files have been encrypted', (val, acc: string[]) => acc.concat(val), [])
    .option('--show-asterisk', 'whether to print password asterisks')
    .action(async function (options: any) {
      logger.setName(`${ name } encrypt`)

      const cwd: string = options.args[0] || path.resolve()
      const packageJsonPath = path.resolve(cwd, 'package.json')
      const defaultOptions = createDefaultOptions(packageJsonPath)

      // reset log-level
      const logLevel = parseOption<string>(options.logLevel, defaultOptions.logLevel)
      if (logLevel != null) {
        const level = Level.valueOf(logLevel)
        if (level != null) logger.setLevel(level)
      }

      // get secretFilepath
      const secretFilepath: string = path.resolve(cwd,
        parseOption<string>(
          options.secretFilepath, defaultOptions.secretFilepath, isNotEmptyString))

      // get indexFilepath
      const indexFilepath: string = path.resolve(cwd,
        parseOption<string>(
          options.indexFilepath, defaultOptions.indexFilepath, isNotEmptyString))

      // get showAsterisk
      const showAsterisk: boolean = parseOption<boolean>(
        convertToBoolean(options.showAsterisk), defaultOptions.showAsterisk)

      // get plainFilepathPatterns
      const plainFilepathPatterns: string[] = parseOption<string[]>(
        options.plainFilepathPattern, defaultOptions.plainFilepathPatterns, isNotEmptyArray)

      // get cipherFilepathPatterns
      const cipherFilepathPatterns: string[] = parseOption<string[]>(
        options.cipherFilepathPattern, defaultOptions.cipherFilepathPatterns, isNotEmptyArray)

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
