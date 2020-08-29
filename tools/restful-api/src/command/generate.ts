import {
  SubCommandExecutor,
  SubCommandMounter,
  SubCommandProcessor,
  createSubCommandExecutor,
  createSubCommandMounter,
} from '@barusu/util-cli'
import {
  SubCommandGenerateOptions,
  createRestfulApiGenerateContextFromOptions,
  createSubCommandGenerate,
} from '../core/generate/command'
import { RestfulApiGenerateContext } from '../core/generate/context'
import { RestfulApiGenerateProcessor } from '../core/generate/processor'
import { handleError } from './_util'


/**
 * Process sub-command: 'generate'
 *
 * @param options
 * @returns {void|Promise<void>}
 */
export const processSubCommandGenerate: SubCommandProcessor<SubCommandGenerateOptions, void> =
  async function (
    options: SubCommandGenerateOptions
  ): Promise<void> {
    try {
      const context: RestfulApiGenerateContext =
        await createRestfulApiGenerateContextFromOptions(options)
      const processor = new RestfulApiGenerateProcessor(context)
      await processor.generate()
    } catch (error) {
      handleError(error)
    }
  }


/**
 * Mount Sub-command: generate
 *
 * @param {Command}   parentCommand
 * @returns {void}
 */
export const mountSubCommandGenerate: SubCommandMounter =
  createSubCommandMounter<SubCommandGenerateOptions, void>(
    createSubCommandGenerate,
    processSubCommandGenerate,
  )


/**
 * Execute sub-command: 'generate'
 *
 * @param {Command}   parentCommand
 * @param {string[]}  args
 * @returns {Promise}
 */
export const execSubCommandGenerate: SubCommandExecutor<void>
  = createSubCommandExecutor<SubCommandGenerateOptions, void>(
    createSubCommandGenerate,
    processSubCommandGenerate,
  )
