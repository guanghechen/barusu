import type {
  SubCommandExecutor,
  SubCommandMounter,
  SubCommandProcessor,
} from '@guanghechen/commander-helper'
import {
  createSubCommandExecutor,
  createSubCommandMounter,
} from '@guanghechen/commander-helper'
import type { SubCommandStatOptions } from '../core/stat/command'
import {
  createSubCommandStat,
  createWordStatContextFromOptions,
} from '../core/stat/command'
import type { WordStatContext } from '../core/stat/context'
import { WordStatProcessor } from '../core/stat/processor'
import { handleError } from './_util'

/**
 * Process sub-command: 'stat'
 *
 * @param options
 * @returns {void|Promise<void>}
 */
export const processSubCommandStat: SubCommandProcessor<SubCommandStatOptions> =
  async function (options: SubCommandStatOptions): Promise<void> {
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
export const mountSubCommandStat: SubCommandMounter =
  createSubCommandMounter<SubCommandStatOptions>(
    createSubCommandStat,
    processSubCommandStat,
  )

/**
 * Execute sub-command: 'stat'
 *
 * @param {Command}   parentCommand
 * @param {string[]}  args
 * @returns {Promise}
 */
export const execSubCommandStat: SubCommandExecutor =
  createSubCommandExecutor<SubCommandStatOptions>(
    createSubCommandStat,
    processSubCommandStat,
  )
