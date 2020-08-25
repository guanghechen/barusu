import { Command } from '@barusu/util-cli'
import {
  SubCommandStatOptions,
  createSubCommandStat,
} from '../core/stat/command'
import { WordStatContext } from '../core/stat/context'
import { WordStatProcessor } from '../core/stat/processor'
import { EventTypes, eventBus, handleError } from './_util'


/**
 * load Sub-command: stat
 */
export function loadSubCommandStat(
  packageName: string,
  program: Command,
): void | never {
  const handle = async (options: SubCommandStatOptions): Promise<void> => {
    try {
      const context: WordStatContext = {
        cwd: options.cwd,
        workspace: options.workspace,
        encoding: options.encoding,
        filePath: options.filePath,
        filePattern: options.filePattern,
        showDetails: options.showDetails,
        showDetailsPretty: options.showDetailsPretty,
        showSummaryOnly: options.showSummaryOnly,
      }

      const processor = new WordStatProcessor(context)
      await processor.stat()
    } catch (error) {
      handleError(error)
    } finally {
      eventBus.dispatch({ type: EventTypes.EXITING })
    }
  }

  const command = createSubCommandStat(packageName, handle)
  program.addCommand(command)
}
