import {
  SubCommandExecutor,
  SubCommandMounter,
  SubCommandProcessor,
  createSubCommandExecutor,
  createSubCommandMounter,
} from '@barusu/util-cli'
import {
  SubCommandDecryptOptions,
  createGitCipherDecryptContextFromOptions,
  createSubCommandDecrypt,
} from '../core/decrypt/command'
import { GitCipherDecryptContext } from '../core/decrypt/context'
import { GitCipherDecryptProcessor } from '../core/decrypt/processor'
import { handleError } from './_util'


/**
 * Process sub-command: 'decrypt'
 *
 * @param options
 * @returns {void|Promise<void>}
 */
export const processSubCommandDecrypt: SubCommandProcessor<SubCommandDecryptOptions, void> =
  async function (
    options: SubCommandDecryptOptions
  ): Promise<void> {
    try {
      const context: GitCipherDecryptContext =
        await createGitCipherDecryptContextFromOptions(options)
      const processor = new GitCipherDecryptProcessor(context)
      await processor.decrypt()
    } catch (error) {
      handleError(error)
    }
  }


/**
 * Mount Sub-command: decrypt
 *
 * @param {Command}   parentCommand
 * @returns {void}
 */
export const mountSubCommandDecrypt: SubCommandMounter =
  createSubCommandMounter<SubCommandDecryptOptions, void>(
    createSubCommandDecrypt,
    processSubCommandDecrypt,
  )


/**
 * Execute sub-command: 'decrypt'
 *
 * @param {Command}   parentCommand
 * @param {string[]}  args
 * @returns {Promise}
 */
export const execSubCommandDecrypt: SubCommandExecutor<void>
  = createSubCommandExecutor<SubCommandDecryptOptions, void>(
    createSubCommandDecrypt,
    processSubCommandDecrypt,
  )
