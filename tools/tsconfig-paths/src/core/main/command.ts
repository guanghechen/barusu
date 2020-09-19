import path from 'path'
import * as TsconfigUtil from 'tsconfig'
import {
  Command,
  CommandConfigurationFlatOpts,
  MainCommandCreator,
  MainCommandProcessor,
  absoluteOfWorkspace,
} from '@barusu/util-cli'
import {
  cover,
  coverString,
  isNotEmptyArray,
  isNotEmptyString,
} from '@barusu/util-option'
import { packageName } from '../../env/constant'
import { logger } from '../../env/logger'
import { createProgram } from '../command'
import {
  TsconfigPathsContext,
  createTsconfigPathsContext,
} from '../main/context'
import {
  GlobalCommandOptions,
  __defaultGlobalCommandOptions,
  resolveGlobalCommandOptions,
} from '../option'


interface SubMainCommandOptions extends GlobalCommandOptions {
  /**
   * Encoding of source file
   */
  readonly encoding: string
  /**
   * Glob pattern of source file
   */
  readonly pattern: string[]
  /**
   * Path of tsconfig.json
   */
  readonly tsconfigPath: string
  /**
   * Root path of source file
   */
  readonly srcRootDir: string
  /**
   * Root path of target file
   */
  readonly dstRootDir: string
}


const __defaultCommandOptions: SubMainCommandOptions = {
  ...__defaultGlobalCommandOptions,
  encoding: 'utf-8',
  pattern: [],
  tsconfigPath: 'tsconfig.json',
  dstRootDir: 'lib/types',
  srcRootDir: 'src',
}


export type MainCommandOptions = SubMainCommandOptions & CommandConfigurationFlatOpts


/**
 * create main command
 */
export const createMainCommand: MainCommandCreator<MainCommandOptions> =
  function (
    handle?: MainCommandProcessor<MainCommandOptions>
  ): Command {
    const command = createProgram()

    command
      .usage('<workspace> [options]')
      .arguments('<workspace>')
      .requiredOption('--tsconfig-path <tsconfigPath>', 'path of tsconfig.json', 'tsconfig.json')
      .option('-P, --pattern <pattern>', 'glob pattern of source file', (val, acc: string[]) => acc.concat(val), [])
      .option('--src-root-dir <srcRootPath>', 'root path of source files')
      .option('--dst-root-dir <dstRootPath>', 'root path of target files')
      .action(async function ([_workspaceDir], options: MainCommandOptions) {
        logger.setName('')

        const defaultOptions: MainCommandOptions = resolveGlobalCommandOptions(
          packageName, false, __defaultCommandOptions, _workspaceDir, options)

        // resolve encoding
        const encoding: string = cover<string>(
          defaultOptions.encoding, options.encoding, isNotEmptyString)
        logger.debug('encoding:', encoding)

        // resolve pattern
        const pattern: string[] = cover<string[]>(
          defaultOptions.pattern, options.pattern, isNotEmptyArray)
        logger.debug('pattern:', pattern)

        // resolve tsconfigPath
        const tsconfigPath: string = absoluteOfWorkspace(defaultOptions.workspace,
          cover<string>(defaultOptions.tsconfigPath, options.tsconfigPath, isNotEmptyString))
        logger.debug('tsconfigPath:', tsconfigPath)

        // resolve workspace
        const { path: configPath } = TsconfigUtil.loadSync(defaultOptions.workspace, tsconfigPath)
        const workspace = coverString(defaultOptions.workspace, absoluteOfWorkspace(
          defaultOptions.workspace, path.dirname(configPath || '')))
        logger.debug('workspace:', workspace)

        // resolve srcRootDir
        const srcRootDir: string = absoluteOfWorkspace(workspace,
          coverString(defaultOptions.srcRootDir, options.srcRootDir, isNotEmptyString))
        logger.debug('srcRootDir:', srcRootDir)

        // resolve dstRootDir
        const dstRootDir: string = absoluteOfWorkspace(workspace,
          coverString(defaultOptions.dstRootDir, options.dstRootDir, isNotEmptyString))
        logger.debug('dstRootDir:', dstRootDir)

        const resolvedOptions: MainCommandOptions = {
          ...defaultOptions,
          workspace,
          encoding,
          pattern,
          tsconfigPath,
          srcRootDir,
          dstRootDir,
        }

        if (handle != null) {
          await handle(resolvedOptions)
        }
      })

    return command
  }


/**
 * Create TsconfigPathsContext
 * @param options
 */
export async function createTsconfigPathsContextFromOptions(
  options: MainCommandOptions,
): Promise<TsconfigPathsContext> {
  const context: TsconfigPathsContext = await createTsconfigPathsContext({
    cwd: options.cwd,
    workspace: options.workspace,
    encoding: options.encoding,
    pattern: options.pattern,
    tsconfigPath: options.tsconfigPath,
    srcRootDir: options.srcRootDir,
    dstRootDir: options.dstRootDir,
  })
  return context
}
