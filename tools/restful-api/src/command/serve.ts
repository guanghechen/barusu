import { Command } from '@barusu/util-cli'
import {
  RestfulApiServeContext,
  RestfulApiServeProcessor,
  SubCommandServeOptions,
  createRestfulApiServeContextFromOptions,
  createSubCommandServe,
} from '../index'
import { handleError } from './_util'


/**
 * load Sub-command: serve
 */
export function loadSubCommandServe(
  packageName: string,
  program: Command,
): void {
  const process = async (options: SubCommandServeOptions): Promise<void> => {
    try {
      const context: RestfulApiServeContext =
        await createRestfulApiServeContextFromOptions(options)
      const processor = new RestfulApiServeProcessor(context)
      processor.start()
    } catch (error) {
      handleError(error)
    }
  }

  const command = createSubCommandServe(packageName, process)
  program.addCommand(command)
}
