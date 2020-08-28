import { Command } from '@barusu/util-cli'
import {
  RestfulApiServeContext,
  RestfulApiServeProcessor,
  SubCommandServeOptions,
  createRestfulApiServeContext,
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
      const context: RestfulApiServeContext = await createRestfulApiServeContext({
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
        mockDataPrefixUrl: options.mockDataPrefixUrl,
        mockDataRootDir: options.mockDataRootDir,
        mockResourcePrefixUrl: options.mockResourcePrefixUrl,
        mockResourceRootDir: options.mockResourceRootDir,
      })

      const processor = new RestfulApiServeProcessor(context)
      processor.start()
    } catch (error) {
      handleError(error)
    }
  }

  const command = createSubCommandServe(packageName, process)
  program.addCommand(command)
}
