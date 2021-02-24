import {
  SubCommandExecutor,
  SubCommandMounter,
  SubCommandProcessor,
  createSubCommandExecutor,
  createSubCommandMounter,
} from '@barusu/util-cli'
import {
  SubCommandStatOptions,
  createSubCommandStat,
  createWordStatContextFromOptions,
} from '../core/stat/command'
import { WordStatContext } from '../core/stat/context'
import { WordStatProcessor } from '../core/stat/processor'
import { handleError } from './_util'

/**
 * Process sub-command: 'stat'
 *
 * @param options
 * @returns {void|Promise<void>}
 */
export const processSubCommandStat: SubCommandProcessor<
  SubCommandStatOptions,
  void
> = async function (options: SubCommandStatOptions): Promise<void> {
  try {
    const context: WordStatContext = await createWordStatContextFromOptions(
      options,
    )
    const processor = new WordStatProcessor(context)
    await processor.stat()
  } catch (error) {
    handleError(error)
  }
}

/**
 * Mount Sub-command: stat
 *
 * @param {Command}   parentCommand
 * @returns {void}
 */
export const mountSubCommandStat: SubCommandMounter = createSubCommandMounter<
  SubCommandStatOptions,
  void
>(createSubCommandStat, processSubCommandStat)

/**
 * Execute sub-command: 'stat'
 *
 * @param {Command}   parentCommand
 * @param {string[]}  args
 * @returns {Promise}
 */
export const execSubCommandStat: SubCommandExecutor<void> = createSubCommandExecutor<
  SubCommandStatOptions,
  void
>(createSubCommandStat, processSubCommandStat)
