import {
  SubCommandExecutor,
  SubCommandMounter,
  SubCommandProcessor,
  createSubCommandExecutor,
  createSubCommandMounter,
} from '@barusu/util-cli'
import {
  SubCommandServeOptions,
  createRestfulApiServeContextFromOptions,
  createSubCommandServe,
} from '../core/serve/command'
import { RestfulApiServeContext } from '../core/serve/context'
import { RestfulApiServeProcessor } from '../core/serve/processor'
import { handleError } from './_util'


/**
 * Process sub-command: 'serve'
 *
 * @param options
 * @returns {void|Promise<void>}
 */
export const processSubCommandServe: SubCommandProcessor<SubCommandServeOptions, void> =
  async function (
    options: SubCommandServeOptions
  ): Promise<void> {
    try {
      const context: RestfulApiServeContext =
        await createRestfulApiServeContextFromOptions(options)
      const processor = new RestfulApiServeProcessor(context)
      processor.start()
    } catch (error) {
      handleError(error)
    }
  }


/**
 * Mount Sub-command: serve
 */
export const mountSubCommandServe: SubCommandMounter =
  createSubCommandMounter<SubCommandServeOptions, void>(
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
export const execSubCommandServe: SubCommandExecutor<void>
  = createSubCommandExecutor<SubCommandServeOptions, void>(
    createSubCommandServe,
    processSubCommandServe,
  )
