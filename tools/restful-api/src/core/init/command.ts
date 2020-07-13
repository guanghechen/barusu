import { Command, CommandConfigurationFlatOpts } from '@barusu/util-cli'
import { logger } from '../../util/logger'
import {
  GlobalCommandOptions,
  __defaultGlobalCommandOptions,
  resolveGlobalCommandOptions,
} from '../option'


interface SubCommandOptions extends GlobalCommandOptions {

}


const __defaultCommandOptions: SubCommandOptions = {
  ...__defaultGlobalCommandOptions,
}


export type SubCommandInitOptions = SubCommandOptions & CommandConfigurationFlatOpts


/**
 * create Sub-command: init
 */
export function createSubCommandInit(
  packageName: string,
  handle?: (options: SubCommandInitOptions) => void | Promise<void>,
  commandName = 'init',
  aliases: string[] = ['i'],
): Command {
  const command = new Command()

  command
    .name(commandName)
    .aliases(aliases)
    .arguments('<workspace>')
    .action(async function ([_workspaceDir], options: SubCommandOptions) {
      logger.setName(commandName)

      const defaultOptions: SubCommandInitOptions = resolveGlobalCommandOptions(
        packageName, commandName, __defaultCommandOptions, _workspaceDir, options)

      const resolvedOptions: SubCommandInitOptions = {
        ...defaultOptions,
      }

      if (handle != null) {
        await handle(resolvedOptions)
      }
    })

  return command
}
