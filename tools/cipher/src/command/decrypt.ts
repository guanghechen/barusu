import { CommanderStatic } from 'commander'
import globby from 'globby'
import path from 'path'
import { Level } from '@barusu/chalk-logger'
import {
  ConfigFlatOpts,
  absoluteOfWorkspace,
  findPackageJsonPath,
  flagDefaultOptions,
  mkdirsIfNotExists,
  relativeOfWorkspace,
} from '@barusu/util-cli'
import {
  convertToBoolean,
  convertToNumber,
  cover,
  coverString,
  isNotEmptyArray,
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


const SUB_COMMAND_NAME = 'decrypt'


interface SubCommandOptions extends GlobalCommandOptions {
  /**
   * root dir of outputs
   * @default plain-bak
   */
  outDir: string
  /**
   * root dir of cipher files
   * @default cipher
   */
  cipherDir: string
  /**
   * do decrypt event the target filepath has already exists.
   * @default false
   */
  force: boolean
  /**
   * glob pattern of files have been encrypted
   * @default []
   */
  cipherFilepathPattern: string[]
}


const defaultCommandOptions: SubCommandOptions = {
  ...defaultGlobalCommandOptions,
  outDir: 'plain-bak',
  cipherDir: 'cipher',
  force: false,
  cipherFilepathPattern: [],
}


/**
 * load Sub-command: encrypt
 */
export function loadSubCommandDecrypt(
  name: string,
  program: CommanderStatic,
): void {
  program
    .command(`${ SUB_COMMAND_NAME } <workspace>`)
    .option('-S, --secret-filepath <secret filepath>', 'path of secret file')
    .option('-I, --index-filepath <cipher files index>', 'path of index of cipher files')
    .option('-C, --cipher-filepath-pattern <glob pattern>', 'glob pattern of files have been encrypted', (val, acc: string[]) => acc.concat(val), [])
    .option('-o, --out-dir <outDir>', 'root dir of outputs')
    .option('--cipher-dir <cipherDir>', 'root dir of cipher files')
    .option('-f, --force', 'do decrypt event the target filepath has already exists.')
    .option('--show-asterisk', 'whether to print password asterisks')
    .option('--minimum-password-length', 'the minimum size required of password')
    .action(async function (workspace: string, options: Partial<SubCommandOptions>) {
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

      // resolve outDir
      const outDir: string = absoluteOfWorkspace(workspaceDir,
        cover<string>(defaultOptions.outDir, options.outDir, isNotEmptyString))
      logger.debug('outDir:', outDir)

      // resolve cipherDir
      const cipherDir: string = absoluteOfWorkspace(workspaceDir,
        cover<string>(
          defaultOptions.cipherDir, options.cipherDir, isNotEmptyString))
      logger.debug('cipherDir:', cipherDir)

      // resolve secretFilepath
      const secretFilepath: string = absoluteOfWorkspace(workspaceDir,
        cover<string>(
          defaultOptions.secretFilepath, options.secretFilepath, isNotEmptyString))
      logger.debug('secretFilepath:', secretFilepath)

      // resolve indexFilepath
      const indexFilepath: string = absoluteOfWorkspace(cipherDir,
        cover<string>(
          defaultOptions.indexFilepath, options.indexFilepath, isNotEmptyString))
      logger.debug('indexFilepath:', indexFilepath)

      // resolve force
      const force: boolean = cover<boolean>(
        defaultOptions.force, convertToBoolean(options.force))
      logger.debug('force:', force)

      // resolve showAsterisk
      const showAsterisk: boolean = cover<boolean>(
        defaultOptions.showAsterisk, convertToBoolean(options.showAsterisk))
      logger.debug('showAsterisk:', showAsterisk)

      // resolve miniumPasswordLength
      const miniumPasswordLength: number = cover<number>(
        defaultOptions.miniumPasswordLength, convertToNumber(options.miniumPasswordLength)
      )
      logger.debug('miniumPasswordLength:', miniumPasswordLength)

      // resolve cipherFilepathPatterns
      const cipherFilepathPatterns: string[] = cover<string[]>(
        defaultOptions.cipherFilepathPattern, options.cipherFilepathPattern, isNotEmptyArray)
      logger.debug('cipherFilepathPatterns:', cipherFilepathPatterns)

      // calc cipherRelativeDir
      const cipherRelativeDir = relativeOfWorkspace(workspaceDir, cipherDir)
      logger.debug('cipherRelativeDir:', cipherRelativeDir)

      // calc outRelativeDir
      const outRelativeDir = relativeOfWorkspace(workspaceDir, outDir)
      logger.debug('outRelativeDir:', outRelativeDir)

      // ensure paths exist
      mkdirsIfNotExists(workspaceDir, true, logger)
      mkdirsIfNotExists(cipherDir, true, logger)
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

        // parse workspace
        const workspaceCatalog = await master.loadIndex(indexFilepath, cipherRelativeDir)
        if (workspaceCatalog == null) {
          throw new Error('[fix me] workspaceCatalog is null')
        }

        const resolveDestPath = (cipherFilepath: string) => {
          const plainFilepath: string | null = workspaceCatalog
            .resolvePlainFilepath(path.relative(cipherRelativeDir, cipherFilepath))
          if (plainFilepath == null) {
            throw new Error(`[fix me] plainFilepath is null: cipherFilepath(${ cipherFilepath })`)
          }
          return plainFilepath
        }

        // If cipherFilepathPatterns is null, decrypt all files registered in workspace catalog,
        // Otherwise, only decrypt files matched cipherFilepathPatterns.
        const cipherFilepaths = cipherFilepathPatterns.length > 0
          ? await globby(cipherFilepathPatterns, { cwd: workspaceDir })
          : workspaceCatalog.toData().items.map(x => path.join(cipherRelativeDir, x.cipherFilepath))
        await master.decryptFiles(cipherFilepaths, outRelativeDir, resolveDestPath, force)
      } catch (error) {
        handleError(error)
      }
      eventBus.dispatch({ type: EventTypes.EXITING })
    })
}
