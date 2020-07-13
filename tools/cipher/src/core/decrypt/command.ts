import {
  Command,
  CommandConfigurationFlatOpts,
  absoluteOfWorkspace,
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


const __defaultCommandOptions: SubCommandOptions = {
  ...__defaultGlobalCommandOptions,
  outDir: 'plain-bak',
  force: false,
  cipherFilepathPattern: [],
}


export type SubCommandDecryptOptions = SubCommandOptions & CommandConfigurationFlatOpts


/**
 * create Sub-command: decrypt (d)
 */
export function createSubCommandDecrypt(
  packageName: string,
  handle?: (options: SubCommandDecryptOptions) => void | Promise<void>,
  commandName = 'decrypt',
  aliases: string[] = ['d'],
): Command {
  const command = new Command()

  command
    .storeOptionsAsProperties(false)
    .passCommandToAction(false)
    .name(commandName)
    .aliases(aliases)
    .arguments('<workspace>')
    .option('-C, --cipher-filepath-pattern <glob pattern>', 'glob pattern of files have been encrypted', (val, acc: string[]) => acc.concat(val), [])
    .option('-o, --out-dir <outDir>', 'root dir of outputs')
    .option('-f, --force', 'do decrypt event the target filepath has already exists.')
    .action(async function ([_workspace], options: SubCommandOptions) {
      logger.setName(commandName)

      const defaultOptions: SubCommandDecryptOptions = resolveGlobalCommandOptions(
        packageName, commandName, __defaultCommandOptions, _workspace, options)
      const { workspace } = defaultOptions

      // resolve outDir
      const outDir: string = absoluteOfWorkspace(workspace,
        cover<string>(defaultOptions.outDir, options.outDir, isNotEmptyString))
      logger.debug('outDir:', outDir)

      // resolve force
      const force: boolean = cover<boolean>(
        defaultOptions.force, convertToBoolean(options.force))
      logger.debug('force:', force)

      // resolve cipherFilepathPatterns
      const cipherFilepathPatterns: string[] = cover<string[]>(
        defaultOptions.cipherFilepathPattern, options.cipherFilepathPattern, isNotEmptyArray)
      logger.debug('cipherFilepathPatterns:', cipherFilepathPatterns)

      const resolvedOptions: SubCommandDecryptOptions = {
        ...defaultOptions,
        outDir,
        force,
        cipherFilepathPatterns,
      }

      if (handle != null) {
        await handle(resolvedOptions)
      }
    })

  return command
}
