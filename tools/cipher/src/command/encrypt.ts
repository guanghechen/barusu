import { CommanderStatic } from 'commander'
import globby from 'globby'
import path from 'path'
import { Level } from '@barusu/chalk-logger'
import { mkdirsIfNotExists, parseOption } from '@barusu/util-cli'
import {
  convertToBoolean,
  convertToNumber,
  isNotEmptyArray,
  isNotEmptyString,
} from '@barusu/option-util'
import { WorkspaceCatalog } from '../util/catalog'
import { EventTypes, eventBus } from '../util/event-bus'
import { logger } from '../util/logger'
import { CipherMaster } from '../util/master'
import { createDefaultOptions, handleError } from './_util'


const SUB_COMMAND_NAME = 'encrypt'


/**
 * load Sub-command: encrypt
 */
export function loadSubCommandEncrypt(
  name: string,
  program: CommanderStatic,
): void {
  program
    .command(`${ SUB_COMMAND_NAME } <directory>`)
    .option('-S, --secret-filepath <secret filepath>', 'path of secret file')
    .option('-I, --index-filepath <cipher files index>', 'path of index of cipher files')
    .option('-P, --plain-filepath-pattern <glob pattern>', 'glob pattern of files to be encrypted', (val, acc: string[]) => acc.concat(val), [])
    .option('-o, --out-dir <outDir>', 'root dir of outputs')
    .option('-f, --force', 'do encrypt event the target filepath has already exists.')
    .option('--show-asterisk', 'whether to print password asterisks')
    .option('--minimum-password-length', 'the minimum size required of password')
    .action(async function (workspace: string, options: any) {
      logger.setName(`${ name } ${ SUB_COMMAND_NAME }`)

      const workspaceDir: string = workspace || path.resolve()
      logger.debug('workspaceDir:', workspaceDir)

      const packageJsonPath = path.resolve(workspaceDir, 'package.json')
      logger.debug('packageJsonPath:', packageJsonPath)

      const defaultOptions = createDefaultOptions(packageJsonPath, SUB_COMMAND_NAME)

      // reset log-level
      const logLevel = parseOption<string>(defaultOptions.logLevel, program.logLevel)
      if (logLevel != null) {
        const level = Level.valueOf(logLevel)
        if (level != null) logger.setLevel(level)
      }

      // get outDir
      const outDir: string = path.resolve(workspaceDir,
        parseOption<string>(
          defaultOptions.outDir, options.outDir, isNotEmptyString))
      logger.debug('outDir:', outDir)

      // get secretFilepath
      const secretFilepath: string = path.resolve(workspaceDir,
        parseOption<string>(
          defaultOptions.secretFilepath, options.secretFilepath, isNotEmptyString))
      logger.debug('secretFilepath:', secretFilepath)

      // get indexFilepath
      const indexFilepath: string = path.resolve(outDir,
        parseOption<string>(
          defaultOptions.indexFilepath, options.indexFilepath, isNotEmptyString))
      logger.debug('indexFilepath:', indexFilepath)

      // get force
      const force: boolean = parseOption<boolean>(
        defaultOptions.force, convertToBoolean(options.force))
      logger.debug('force:', force)

      // get showAsterisk
      const showAsterisk: boolean = parseOption<boolean>(
        defaultOptions.showAsterisk, convertToBoolean(options.showAsterisk))
      logger.debug('showAsterisk:', showAsterisk)

      // get miniumPasswordLength
      const miniumPasswordLength: number = parseOption<number>(
        defaultOptions.miniumPasswordLength, convertToNumber(options.miniumPasswordLength)
      )
      logger.debug('miniumPasswordLength:', miniumPasswordLength)

      // get plainFilepathPatterns
      const plainFilepathPatterns: string[] = parseOption<string[]>(
        defaultOptions.plainFilepathPatterns, options.plainFilepathPattern, isNotEmptyArray)
      logger.debug('plainFilepathPatterns:', plainFilepathPatterns)

      // calc outRelativeDir
      const outRelativeDir = path.relative(workspaceDir, outDir)
      logger.debug('outRelativeDir:', outRelativeDir)

      // ensure paths exist
      mkdirsIfNotExists(workspaceDir, true, logger)
      mkdirsIfNotExists(outDir, true, logger)
      mkdirsIfNotExists(secretFilepath, false, logger)
      mkdirsIfNotExists(indexFilepath, false, logger)

      try {
        const master = new CipherMaster({
          workspaceDir,
          showAsterisk,
          secretFilepath,
          minimumSize: miniumPasswordLength,
        })

        const workspaceCatalog = (
          (await master.loadIndex(indexFilepath, outRelativeDir)) ||
          new WorkspaceCatalog({ items: [], cipherRelativeDir: outRelativeDir })
        )

        const resolveDestPath = (plainFilepath: string) => {
          const cipherFilepath: string = workspaceCatalog
            .resolveCipherFilepath(plainFilepath)
          return cipherFilepath
        }

        const plainFilepaths = await globby(plainFilepathPatterns, { cwd: workspaceDir })
        await master.encryptFiles(plainFilepaths, outRelativeDir, resolveDestPath, force)
        await master.saveIndex(indexFilepath, workspaceCatalog)
      } catch (error) {
        handleError(error)
      }
      eventBus.dispatch({ type: EventTypes.EXITING })
    })
}
