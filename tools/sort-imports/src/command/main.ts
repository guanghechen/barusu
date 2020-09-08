import {
  MainCommandExecutor,
  MainCommandMounter,
  MainCommandProcessor,
  createMainCommandExecutor,
  createMainCommandMounter,
} from '@barusu/util-cli'
import {
  MainCommandOptions,
  createMainCommand,
  createSortImportsContextFromOptions,
} from '../core/main/command'
import { SortImportsContext } from '../core/main/context'
import { SortImportsProcessor } from '../core/main/processor'
import { handleError } from './_util'


/**
 * Process main command
 *
 * @param options
 * @returns {void|Promise<void>}
 */
export const processMainCommand: MainCommandProcessor<MainCommandOptions, void> =
  async function (
    options: MainCommandOptions
  ): Promise<void> {
    try {
      const context: SortImportsContext =
        await createSortImportsContextFromOptions(options)
      const processor = new SortImportsProcessor(context)
      await processor.sortStatements()
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
export const mountMainCommand: MainCommandMounter =
  createMainCommandMounter<MainCommandOptions, void>(
    createMainCommand,
    processMainCommand,
  )


/**
 * Execute main command
 *
 */
export const execMainCommand: MainCommandExecutor<void>
  = createMainCommandExecutor<MainCommandOptions, void>(
    createMainCommand,
    processMainCommand,
  )
