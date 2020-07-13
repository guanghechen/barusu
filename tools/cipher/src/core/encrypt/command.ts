import {
  Command,
  CommandConfigurationFlatOpts,
  absoluteOfWorkspace,
  relativeOfWorkspace,
} from '@barusu/util-cli'
import {
  convertToBoolean,
  cover,
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


const __defaultCommandOptions: SubCommandOptions = {
  ...__defaultGlobalCommandOptions,
  outDir: 'plain-bak',
  force: false,
  plainFilepathPattern: [],
}


export type SubCommandEncryptOptions = SubCommandOptions & CommandConfigurationFlatOpts


/**
 * create Sub-command: encrypt (e)
 */
export function createSubCommandEncrypt(
  packageName: string,
  handle?: (options: SubCommandEncryptOptions) => void | Promise<void>,
  commandName = 'encrypt',
  aliases: string[] = ['e'],
): Command {
  const command = new Command()

  command
    .storeOptionsAsProperties(false)
    .passCommandToAction(false)
    .name(commandName)
    .aliases(aliases)
    .arguments('<workspace>')
    .option('-P, --plain-filepath-pattern <glob pattern>', 'glob pattern of files to be encrypted', (val, acc: string[]) => acc.concat(val), [])
    .option('-o, --out-dir <outDir>', 'root dir of outputs')
    .option('-f, --force', 'do encrypt event the target filepath has already exists.')
    .action(async function ([_workspace], options: any) {
      logger.setName(commandName)

      const defaultOptions: SubCommandEncryptOptions = resolveGlobalCommandOptions(
        packageName, commandName, __defaultCommandOptions, _workspace, options)
      const { workspace } = defaultOptions

      // resolve outDir
      const outDir: string = absoluteOfWorkspace(workspace,
        cover<string>(
          defaultOptions.outDir, options.outDir, isNotEmptyString))
      logger.debug('outDir:', outDir)

      // resolve force
      const force: boolean = cover<boolean>(
        defaultOptions.force, convertToBoolean(options.force))
      logger.debug('force:', force)

      // resolve plainFilepathPatterns
      const plainFilepathPattern: string[] = cover<string[]>(
        defaultOptions.plainFilepathPattern, options.plainFilepathPattern, isNotEmptyArray)
      logger.debug('plainFilepathPatterns:', plainFilepathPattern)

      // calc outRelativeDir
      const outRelativeDir = relativeOfWorkspace(workspace, outDir)
      logger.debug('outRelativeDir:', outRelativeDir)

      const resolvedOptions: SubCommandEncryptOptions = {
        ...defaultOptions,
        outDir,
        force,
        plainFilepathPattern,
      }

      if (handle != null) {
        await handle(resolvedOptions)
      }
    })

  return command
}
