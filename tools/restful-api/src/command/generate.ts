import type {
  SubCommandExecutor,
  SubCommandMounter,
  SubCommandProcessor,
} from '@barusu/util-cli'
import {
  createSubCommandExecutor,
  createSubCommandMounter,
} from '@barusu/util-cli'
import type { SubCommandGenerateOptions } from '../core/generate/command'
import {
  createRestfulApiGenerateContextFromOptions,
  createSubCommandGenerate,
} from '../core/generate/command'
import type { RestfulApiGenerateContext } from '../core/generate/context'
import { RestfulApiGenerateProcessor } from '../core/generate/processor'
import { handleError } from './_util'

/**
 * Process sub-command: 'generate'
 *
 * @param options
 * @returns {void|Promise<void>}
 */
export const processSubCommandGenerate: SubCommandProcessor<SubCommandGenerateOptions> = async function (
  options: SubCommandGenerateOptions,
): Promise<void> {
  try {
    const context: RestfulApiGenerateContext = await createRestfulApiGenerateContextFromOptions(
      options,
    )
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
export const mountSubCommandGenerate: SubCommandMounter = createSubCommandMounter<SubCommandGenerateOptions>(
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
export const execSubCommandGenerate: SubCommandExecutor = createSubCommandExecutor<SubCommandGenerateOptions>(
  createSubCommandGenerate,
  processSubCommandGenerate,
)
