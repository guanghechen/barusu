import type {
  SubCommandExecutor,
  SubCommandMounter,
  SubCommandProcessor,
} from '@guanghechen/commander-helper'
import {
  createSubCommandExecutor,
  createSubCommandMounter,
} from '@guanghechen/commander-helper'
import type { SubCommandInitOptions } from '../core/init/command'
import {
  createRestfulApiInitContextFromOptions,
  createSubCommandInit,
} from '../core/init/command'
import type { RestfulApiInitContext } from '../core/init/context'
import { RestfulApiInitProcessor } from '../core/init/processor'
import { handleError } from './_util'

/**
 * Process sub-command: 'init'
 *
 * @param options
 * @returns {void|Promise<void>}
 */
export const processSubCommandInit: SubCommandProcessor<SubCommandInitOptions> =
  async function (options: SubCommandInitOptions): Promise<void> {
    try {
      const context: RestfulApiInitContext =
        await createRestfulApiInitContextFromOptions(options)
      const processor = new RestfulApiInitProcessor(context)
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
export const mountSubCommandInit: SubCommandMounter =
  createSubCommandMounter<SubCommandInitOptions>(
    createSubCommandInit,
    processSubCommandInit,
  )

/**
 * Execute sub-command: 'init'
 *
 * @param {Command}   parentCommand
 * @param {string[]}  args
 * @returns {Promise}
 */
export const execSubCommandInit: SubCommandExecutor =
  createSubCommandExecutor<SubCommandInitOptions>(
    createSubCommandInit,
    processSubCommandInit,
  )
