import { Command } from '@barusu/util-cli'
import {
  SubCommandStatOptions,
  createSubCommandStat,
} from '../core/stat/command'
import { WordCountStatContext } from '../core/stat/context'
import { WordCountStatProcessor } from '../core/stat/processor'
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
      const context: WordCountStatContext = {
        cwd: options.cwd,
        workspace: options.workspace,
        encoding: options.encoding,
        filePath: options.filePath,
        filePattern: options.filePattern,
        showDetails: options.showDetails,
        showSummaryOnly: options.showSummaryOnly,
      }

      const processor = new WordCountStatProcessor(context)
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
