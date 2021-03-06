import type {
  MainCommandExecutor,
  MainCommandMounter,
  MainCommandProcessor,
} from '@barusu/util-cli'
import {
  createMainCommandExecutor,
  createMainCommandMounter,
} from '@barusu/util-cli'
import type { MainCommandOptions } from '../core/main/command'
import {
  createMainCommand,
  createTsconfigPathsContextFromOptions,
} from '../core/main/command'
import type { TsconfigPathsContext } from '../core/main/context'
import { TsconfigPathsProcessor } from '../core/main/processor'
import { handleError } from './_util'

/**
 * Process main command
 *
 * @param options
 * @returns {void|Promise<void>}
 */
export const processMainCommand: MainCommandProcessor<MainCommandOptions> = async function (
  options: MainCommandOptions,
): Promise<void> {
  try {
    const context: TsconfigPathsContext = await createTsconfigPathsContextFromOptions(
      options,
    )
    const processor = new TsconfigPathsProcessor(context)
    await processor.process()
  } catch (error) {
    handleError(error)
  }
}

/**
 * Mount main command
 *
 * @param {Command}         parentCommand
 * @param {CommandOptions}  opts
 * @returns {void}
 */
export const mountMainCommand: MainCommandMounter = createMainCommandMounter<MainCommandOptions>(
  createMainCommand,
  processMainCommand,
)

/**
 * Execute main command
 *
 */
export const execMainCommand: MainCommandExecutor = createMainCommandExecutor<MainCommandOptions>(
  createMainCommand,
  processMainCommand,
)
