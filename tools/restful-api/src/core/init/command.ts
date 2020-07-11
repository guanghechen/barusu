import path from 'path'
import { ConfigFlatOpts, resolveCommandOptions } from '@barusu/util-cli'
import { commander } from '@barusu/util-cli'
import { cover, isNotEmptyString } from '@barusu/util-option'
import { logger } from '../../util/logger'
import {
  GlobalCommandOptions,
  __defaultGlobalCommandOptions,
} from '../../util/option'


interface SubCommandOptions extends GlobalCommandOptions {
  /**
   * Path of tsconfig.json
   * @default tsconfig.json
   */
  tsconfigPath: string
  /**
   * The encoding format of files in the working directory
   * @default 'utf-8'
   */
  encoding: string
}


const __defaultCommandOptions: SubCommandOptions = {
  ...__defaultGlobalCommandOptions,
  tsconfigPath: 'tsconfig.json',
  encoding: 'utf-8',
}


export type SubCommandInitOptions = SubCommandOptions & ConfigFlatOpts


/**
 * create Sub-command: init
 */
export function createSubCommandInit(
  packageName: string,
  process?: (options: SubCommandInitOptions) => void | Promise<void>,
  commandName = 'init',
  aliases: string[] = ['i'],
): commander.Command {
  const command = new commander.Command()

  command
    .name(commandName)
    .aliases(aliases)
    .arguments('<workspace>')
    .option('-p, --tsconfig-path <tsconfigPath>', 'path of tsconfig.json (absolute or relative to the workspace)')
    .option('-e, --encoding <encoding>', 'specify encoding of all files.')
    .action(async function (_workspaceDir: string, options: SubCommandOptions) {
      logger.setName(commandName)
      const defaultOptions: SubCommandInitOptions = resolveCommandOptions<
        SubCommandOptions, SubCommandOptions>(
          logger, packageName, commandName,
          __defaultCommandOptions, _workspaceDir, options)
      const { workspace } = defaultOptions

      // resolve tsconfig.json filepath
      const tsconfigPath: string = path.resolve(workspace, cover<string>(
        defaultOptions.tsconfigPath, options.tsconfigPath, isNotEmptyString))
      logger.debug('tsconfigPath:', tsconfigPath)

      // resolve encoding
      const encoding: string = cover<string>(
        __defaultCommandOptions.encoding, options.encoding, isNotEmptyString)
      logger.debug('encoding:', encoding)

      const resolvedOptions: SubCommandInitOptions = {
        ...defaultOptions,
        tsconfigPath,
        encoding,
      }

      if (process != null) {
        await process(resolvedOptions)
      }
    })

  return command
}
