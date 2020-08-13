import {
  Command,
  CommandConfigurationFlatOpts,
  absoluteOfWorkspace,
} from '@barusu/util-cli'
import { cover } from '@barusu/util-option'
import { logger } from '../../util/logger'
import {
  GlobalCommandOptions,
  __defaultGlobalCommandOptions,
  resolveGlobalCommandOptions,
} from '../option'


interface SubCommandOptions extends GlobalCommandOptions {
  /**
   * root dir of outputs
   * @default null
   */
  outDir: string | null
}


const __defaultCommandOptions: SubCommandOptions = {
  ...__defaultGlobalCommandOptions,
  outDir: null,
}


export type SubCommandDecryptOptions = SubCommandOptions & CommandConfigurationFlatOpts


/**
 * create Sub-command: decrypt (e)
 */
export function createSubCommandDecrypt(
  packageName: string,
  handle?: (options: SubCommandDecryptOptions) => void | Promise<void>,
  commandName = 'decrypt',
  aliases: string[] = ['d'],
): Command {
  const command = new Command()

  command
    .name(commandName)
    .aliases(aliases)
    .arguments('<workspace>')
    .option('--out-dir <outDir>', 'root dir of outputs (decrypted files)')
    .action(async function ([_workspaceDir], options: SubCommandDecryptOptions) {
      logger.setName(commandName)

      const defaultOptions: SubCommandDecryptOptions = resolveGlobalCommandOptions(
        packageName, commandName, __defaultCommandOptions, _workspaceDir, options)

      // resolve outDir
      const outDir: string | null = (() => {
        const _rawOutDir = cover<string | null>(defaultOptions.outDir, options.outDir)
        if (_rawOutDir == null) return null
        return absoluteOfWorkspace(defaultOptions.workspace, _rawOutDir)
      })()
      logger.debug('outDir:', outDir)


      const resolvedOptions: SubCommandDecryptOptions = {
        ...defaultOptions,
        outDir,
      }

      if (handle != null) {
        await handle(resolvedOptions)
      }
    })

  return command
}
