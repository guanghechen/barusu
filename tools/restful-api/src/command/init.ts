import { CommanderStatic } from 'commander'
import {
  RestfulApiInitializer,
  RestfulApiInitializerContext,
  SubCommandInitOptions,
  createRestfulApiInitializerContext,
  createSubCommandInit,
} from '../index'
import { EventTypes, eventBus, handleError } from './_util'


/**
 * load Sub-command: init
 */
export function loadSubCommandInit(
  packageName: string,
  program: CommanderStatic,
): void {
  const process = async (options: SubCommandInitOptions): Promise<void> => {
    try {
      const context: RestfulApiInitializerContext = createRestfulApiInitializerContext({
        cwd: options.cwd,
        workspace: options.workspace,
        tsconfigPath: options.tsconfigPath,
        encoding: options.encoding,
      })

      const initializer = new RestfulApiInitializer(context)
      await initializer.init()
    } catch (error) {
      handleError(error)
    } finally {
      eventBus.dispatch({ type: EventTypes.EXITING })
    }
  }

  const command = createSubCommandInit(packageName, process)
  program.addCommand(command)
}
