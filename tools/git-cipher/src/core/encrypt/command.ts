import { Command, CommandConfigurationFlatOpts } from '@barusu/util-cli'
import { coverBoolean } from '@barusu/util-option'
import { logger } from '../../util/logger'
import {
  GlobalCommandOptions,
  __defaultGlobalCommandOptions,
  resolveGlobalCommandOptions,
} from '../option'


interface SubCommandOptions extends GlobalCommandOptions {
  /**
   * Whether to update in full, if not, only update files whose mtime is less
   * than the mtime recorded in the index file
   */
  full: boolean
  /**
   * Perform `git fetch --all` before encrypt
   */
  updateBeforeEncrypt: boolean
}


const __defaultCommandOptions: SubCommandOptions = {
  ...__defaultGlobalCommandOptions,
  full: false,
  updateBeforeEncrypt: false,
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
    .name(commandName)
    .aliases(aliases)
    .arguments('<workspace>')
    .option('--full', 'full quantity update')
    .option('--update-before-encrypt', 'perform \'git fetch --all\' before run encryption')
    .action(async function ([_workspaceDir], options: SubCommandEncryptOptions) {
      logger.setName(commandName)

      const defaultOptions: SubCommandEncryptOptions = resolveGlobalCommandOptions(
        packageName, commandName, __defaultCommandOptions, _workspaceDir, options)

      // resolve full
      const full: boolean = coverBoolean(defaultOptions.full, options.full)
      logger.debug('full:', full)

      // resolve updateBeforeEncrypt
      const updateBeforeEncrypt: boolean = coverBoolean(
        defaultOptions.updateBeforeEncrypt, options.updateBeforeEncrypt)
      logger.debug('updateBeforeEncrypt:', updateBeforeEncrypt)

      const resolvedOptions: SubCommandEncryptOptions = {
        ...defaultOptions,
        full,
        updateBeforeEncrypt,
      }

      if (handle != null) {
        await handle(resolvedOptions)
      }
    })

  return command
}
