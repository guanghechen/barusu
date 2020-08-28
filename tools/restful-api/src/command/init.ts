import { Command } from '@barusu/util-cli'
import {
  RestfulApiInitContext,
  RestfulApiInitProcessor,
  SubCommandInitOptions,
  createRestfulApiInitContextFromOptions,
  createSubCommandInit,
} from '../index'
import { EventTypes, eventBus, handleError } from './_util'


/**
 * load Sub-command: init
 */
export function loadSubCommandInit(
  packageName: string,
  program: Command,
): void {
  const process = async (options: SubCommandInitOptions): Promise<void> => {
    try {
      const context: RestfulApiInitContext =
        await createRestfulApiInitContextFromOptions(options)
      const processor = new RestfulApiInitProcessor(context)
      await processor.init()
    } catch (error) {
      handleError(error)
    } finally {
      eventBus.dispatch({ type: EventTypes.EXITING })
    }
  }

  const command = createSubCommandInit(packageName, process)
  program.addCommand(command)
}
