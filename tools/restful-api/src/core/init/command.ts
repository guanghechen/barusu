import {
  Command,
  CommandConfigurationFlatOpts,
  SubCommandCreator,
  SubCommandProcessor,
} from '@barusu/util-cli'
import { cover, isNotEmptyArray } from '@barusu/util-option'
import { packageName } from '../../env/constant'
import { logger } from '../../env/logger'
import {
  GlobalCommandOptions,
  __defaultGlobalCommandOptions,
  resolveGlobalCommandOptions,
} from '../option'
import { RestfulApiInitContext, createRestfulApiInitContext } from './context'


interface SubCommandOptions extends GlobalCommandOptions {
  /**
   * Pass to plop
   */
  readonly plopBypass: string[]
}


const __defaultCommandOptions: SubCommandOptions = {
  ...__defaultGlobalCommandOptions,
  plopBypass: [],
}


export type SubCommandInitOptions = SubCommandOptions & CommandConfigurationFlatOpts


/**
 * create Sub-command: init
 */
export const createSubCommandInit: SubCommandCreator<SubCommandInitOptions> =
  function (
    handle?: SubCommandProcessor<SubCommandInitOptions>,
    commandName = 'init',
    aliases: string[] = ['i'],
  ): Command {
    const command = new Command()

    command
      .name(commandName)
      .aliases(aliases)
      .arguments('<workspace>')
      .option('--plop-bypass <plopBypass>', 'bypass array to plop', (val, acc: string[]) => acc.concat(val), [])
      .action(async function ([_workspaceDir], options: SubCommandOptions) {
        logger.setName(commandName)

        const defaultOptions: SubCommandInitOptions = resolveGlobalCommandOptions(
          packageName, commandName, __defaultCommandOptions, _workspaceDir, options)

        // resolve plopBypass
        const plopBypass: string[] = cover<string[]>(
          defaultOptions.plopBypass, options.plopBypass, isNotEmptyArray)
        logger.debug('plopBypass:', plopBypass)

        const resolvedOptions: SubCommandInitOptions = {
          ...defaultOptions,
          plopBypass,
        }

        if (handle != null) {
          await handle(resolvedOptions)
        }
      })

    return command
  }


/**
 * Create RestfulApiInitContext
 * @param options
 */
export async function createRestfulApiInitContextFromOptions(
  options: SubCommandInitOptions,
): Promise<RestfulApiInitContext> {
  const context: RestfulApiInitContext = createRestfulApiInitContext({
    cwd: options.cwd,
    workspace: options.workspace,
    tsconfigPath: options.tsconfigPath,
    encoding: options.encoding,
    plopBypass: options.plopBypass,
  })
  return context
}
