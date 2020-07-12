import { commander } from '@barusu/util-cli'
import {
  RestfulApiServer,
  RestfulApiServerContext,
  SubCommandServeOptions,
  createRestfulApiServerContext,
  createSubCommandServe,
} from '../index'
import { EventTypes, eventBus, handleError } from './_util'


/**
 * load Sub-command: serve
 */
export function loadSubCommandServe(
  packageName: string,
  program: commander.Command,
): void {
  const process = async (options: SubCommandServeOptions): Promise<void> => {
    try {
      const context: RestfulApiServerContext = await createRestfulApiServerContext({
        cwd: options.cwd,
        workspace: options.workspace,
        tsconfigPath: options.tsconfigPath,
        schemaRootPath: options.schemaRootPath,
        apiConfigPath: options.apiConfigPath,
        encoding: options.encoding,
        host: options.host,
        port: options.port,
        prefixUrl: options.prefixUrl,
        mockRequiredOnly: options.mockRequiredOnly,
        mockOptionalsAlways: options.mockOptionalsAlways,
        mockOptionalsProbability: options.mockOptionalsProbability,
        mockDataFileFirst: options.mockDataFileFirst,
        mockDataFileRootPath: options.mockDataFileRootPath,
      })

      const server = new RestfulApiServer(context)
      server.start()
    } catch (error) {
      handleError(error)
    } finally {
      eventBus.dispatch({ type: EventTypes.EXITING })
    }
  }

  const command = createSubCommandServe(packageName, process)
  program.addCommand(command)
}
