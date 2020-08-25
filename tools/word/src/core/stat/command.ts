import fs from 'fs-extra'
import path from 'path'
import {
  Command,
  CommandConfigurationFlatOpts,
  absoluteOfWorkspace,
} from '@barusu/util-cli'
import {
  cover,
  coverBoolean,
  coverNumber,
  isNotEmptyArray,
} from '@barusu/util-option'
import { logger } from '../../util/logger'
import {
  GlobalCommandOptions,
  __defaultGlobalCommandOptions,
  resolveGlobalCommandOptions,
} from '../option'


interface SubCommandOptions extends GlobalCommandOptions {
  /**
   * File path list to be statistically analyzed
   */
  filePath: string[]
  /**
   * File wildcard list to be statistically analyzed
   */
  filePattern: string[]
  /**
   * The number of rows in the word frequency ranking list to be displayed
   */
  showDetails: number
  /**
   * Do not display statistics for each file, but only display summary information
   */
  showSummaryOnly: boolean
}


const __defaultCommandOptions: SubCommandOptions = {
  ...__defaultGlobalCommandOptions,
  filePath: [],
  filePattern: [],
  showDetails: 0,
  showSummaryOnly: false,
}


export type SubCommandStatOptions = SubCommandOptions & CommandConfigurationFlatOpts


/**
 * create Sub-command: stat (s)
 */
export function createSubCommandStat(
  packageName: string,
  handle?: (options: SubCommandStatOptions) => void | Promise<void>,
  commandName = 'stat',
  aliases: string[] = ['s'],
): Command {
  const command = new Command()

  command
    .name(commandName)
    .aliases(aliases)
    .arguments('<workspace | filepath>')
    .option('-f, --file-path <filePath>', 'source file path using to give statistics', (val, acc: string[]) => acc.concat(val), [])
    .option('-p, --file-pattern <filePattern>', 'file wildcard list using to give statistics', (val, acc: string[]) => acc.concat(val), [])
    .option('--show-details <lineNumber>', 'rows in the word frequency ranking list to be displayed')
    .option('--show-summary-only', 'display summary statistics only')
    .action(async function ([_workspaceDir], options: SubCommandStatOptions) {
      logger.setName(commandName)

      const defaultFilepath: string[] = []
      if (fs.existsSync(_workspaceDir)) {
        const fileStat = fs.statSync(_workspaceDir)
        if (fileStat.isFile()) {
          // it's a file path
          defaultFilepath.push(_workspaceDir)

          // eslint-disable-next-line no-param-reassign
          _workspaceDir = path.dirname(_workspaceDir)
        }
      }

      const defaultOptions: SubCommandStatOptions = resolveGlobalCommandOptions(
        packageName, commandName, __defaultCommandOptions, _workspaceDir, options)

      // resolve filePath
      const filePath: string[] = cover<string[]>(
        defaultOptions.filePath, options.filePath, isNotEmptyArray)
        .concat(defaultFilepath)
        .map(p => absoluteOfWorkspace(defaultOptions.workspace, p))
      logger.debug('filePath:', filePath)

      // resolve filePattern
      const filePattern: string[] = cover<string[]>(
        defaultOptions.filePattern, options.filePattern, isNotEmptyArray)
      if (filePath.length <= 0 && filePattern.length <= 0) {
        filePattern.push('*')
      }
      logger.debug('filePattern:', filePattern)

      // resolve showDetails
      const showDetails: number = coverNumber(defaultOptions.showDetails, options.showDetails)
      logger.debug('showDetails:', showDetails)

      // resolve showSummaryOnly
      const showSummaryOnly: boolean = coverBoolean(
        defaultOptions.showSummaryOnly, options.showSummaryOnly)
      logger.debug('showSummaryOnly:', showSummaryOnly)

      const resolvedOptions: SubCommandStatOptions = {
        ...defaultOptions,
        filePath,
        filePattern,
        showDetails,
        showSummaryOnly,
      }

      if (handle != null) {
        await handle(resolvedOptions)
      }
    })

  return command
}
