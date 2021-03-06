import type {
  SubCommandExecutor,
  SubCommandMounter,
  SubCommandProcessor,
} from '@barusu/util-cli'
import {
  createSubCommandExecutor,
  createSubCommandMounter,
} from '@barusu/util-cli'
import type { SubCommandServeOptions } from '../core/serve/command'
import {
  createRestfulApiServeContextFromOptions,
  createSubCommandServe,
} from '../core/serve/command'
import type { RestfulApiServeContext } from '../core/serve/context'
import { RestfulApiServeProcessor } from '../core/serve/processor'
import { handleError } from './_util'

/**
 * Process sub-command: 'serve'
 *
 * @param options
 * @returns {void|Promise<void>}
 */
export const processSubCommandServe: SubCommandProcessor<SubCommandServeOptions> = async function (
  options: SubCommandServeOptions,
): Promise<void> {
  try {
    const context: RestfulApiServeContext = await createRestfulApiServeContextFromOptions(
      options,
    )
    const processor = new RestfulApiServeProcessor(context)
    processor.start()
  } catch (error) {
    handleError(error)
  }
}

/**
 * Mount Sub-command: serve
 */
export const mountSubCommandServe: SubCommandMounter = createSubCommandMounter<SubCommandServeOptions>(
  createSubCommandServe,
  processSubCommandServe,
)

/**
 * Execute sub-command: 'serve'
 *
 * @param {Command}   parentCommand
 * @param {string[]}  args
 * @returns {Promise}
 */
export const execSubCommandServe: SubCommandExecutor = createSubCommandExecutor<SubCommandServeOptions>(
  createSubCommandServe,
  processSubCommandServe,
)
