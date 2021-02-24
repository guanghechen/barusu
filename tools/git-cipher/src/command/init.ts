import {
  SubCommandExecutor,
  SubCommandMounter,
  SubCommandProcessor,
  createSubCommandExecutor,
  createSubCommandMounter,
} from '@barusu/util-cli'
import {
  SubCommandInitOptions,
  createGitCipherInitContextFromOptions,
  createSubCommandInit,
} from '../core/init/command'
import { GitCipherInitContext } from '../core/init/context'
import { GitCipherInitProcessor } from '../core/init/processor'
import { handleError } from './_util'

/**
 * Process sub-command: 'init'
 *
 * @param options
 * @returns {void|Promise<void>}
 */
export const processSubCommandInit: SubCommandProcessor<
  SubCommandInitOptions,
  void
> = async function (options: SubCommandInitOptions): Promise<void> {
  try {
    const context: GitCipherInitContext = await createGitCipherInitContextFromOptions(
      options,
    )
    const processor = new GitCipherInitProcessor(context)
    await processor.init()
  } catch (error) {
    handleError(error)
  }
}

/**
 * Mount Sub-command: init
 *
 * @param {Command}   parentCommand
 * @returns {void}
 */
export const mountSubCommandInit: SubCommandMounter = createSubCommandMounter<
  SubCommandInitOptions,
  void
>(createSubCommandInit, processSubCommandInit)

/**
 * Execute sub-command: 'init'
 *
 * @param {Command}   parentCommand
 * @param {string[]}  args
 * @returns {Promise}
 */
export const execSubCommandInit: SubCommandExecutor<void> = createSubCommandExecutor<
  SubCommandInitOptions,
  void
>(createSubCommandInit, processSubCommandInit)
