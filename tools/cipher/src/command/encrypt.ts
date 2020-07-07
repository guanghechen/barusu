import { CommanderStatic } from 'commander'
import globby from 'globby'
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
  isNotEmptyArray,
  isNotEmptyString,
} from '@barusu/util-option'
import { WorkspaceCatalog } from '../util/catalog'
import { EventTypes, eventBus } from '../util/event-bus'
import { logger } from '../util/logger'
import { CipherMaster } from '../util/master'
import {
  GlobalCommandOptions,
  defaultGlobalCommandOptions,
  handleError,
} from './_util'


const SUB_COMMAND_NAME = 'encrypt'


interface SubCommandOptions extends GlobalCommandOptions {
  /**
   * root dir of outputs
   * @default plain-bak
   */
  outDir: string
  /**
   * do encrypt event the target filepath has already exists.
   * @default false
   */
  force: boolean
  /**
   * glob pattern of files have been encrypted
   * @default []
   */
  plainFilepathPattern: string[]
}


const defaultCommandOptions: SubCommandOptions = {
  ...defaultGlobalCommandOptions,
  outDir: 'plain-bak',
  force: false,
  plainFilepathPattern: [],
}


/**
 * load Sub-command: encrypt
 */
export function loadSubCommandEncrypt(
  name: string,
  program: CommanderStatic,
): void {
  program
    .command(`${ SUB_COMMAND_NAME } <workspace>`)
    .option('-S, --secret-filepath <secret filepath>', 'path of secret file')
    .option('-I, --index-filepath <cipher files index>', 'path of index of cipher files')
    .option('-P, --plain-filepath-pattern <glob pattern>', 'glob pattern of files to be encrypted', (val, acc: string[]) => acc.concat(val), [])
    .option('-o, --out-dir <outDir>', 'root dir of outputs')
    .option('-f, --force', 'do encrypt event the target filepath has already exists.')
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
      logger.debug('configPath', flatOpts.configPath)
      logger.debug('parasticConfigPath', flatOpts.parasticConfigPath)
      logger.debug('parasticConfigEntry', flatOpts.parasticConfigEntry)

      // get outDir
      const outDir: string = path.resolve(workspaceDir,
        cover<string>(
          defaultOptions.outDir, options.outDir, isNotEmptyString))
      logger.debug('outDir:', outDir)

      // get secretFilepath
      const secretFilepath: string = path.resolve(workspaceDir,
        cover<string>(
          defaultOptions.secretFilepath, options.secretFilepath, isNotEmptyString))
      logger.debug('secretFilepath:', secretFilepath)

      // get indexFilepath
      const indexFilepath: string = path.resolve(outDir,
        cover<string>(
          defaultOptions.indexFilepath, options.indexFilepath, isNotEmptyString))
      logger.debug('indexFilepath:', indexFilepath)

      // get force
      const force: boolean = cover<boolean>(
        defaultOptions.force, convertToBoolean(options.force))
      logger.debug('force:', force)

      // get showAsterisk
      const showAsterisk: boolean = cover<boolean>(
        defaultOptions.showAsterisk, convertToBoolean(options.showAsterisk))
      logger.debug('showAsterisk:', showAsterisk)

      // get miniumPasswordLength
      const miniumPasswordLength: number = cover<number>(
        defaultOptions.miniumPasswordLength, convertToNumber(options.miniumPasswordLength)
      )
      logger.debug('miniumPasswordLength:', miniumPasswordLength)

      // get plainFilepathPatterns
      const plainFilepathPatterns: string[] = cover<string[]>(
        defaultOptions.plainFilepathPattern, options.plainFilepathPattern, isNotEmptyArray)
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
