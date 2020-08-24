import { Command } from '@barusu/util-cli'
import {
  RestfulApiGenerateContext,
  RestfulApiGenerateProcessor,
  SubCommandGenerateOptions,
  createRestfulApiGenerateContext,
  createSubCommandGenerate,
} from '../index'
import { EventTypes, eventBus, handleError } from './_util'


/**
 * load Sub-command: generate
 */
export function loadSubCommandGenerate(
  packageName: string,
  program: Command,
): void {
  const process = async (options: SubCommandGenerateOptions): Promise<void> => {
    try {
      const context: RestfulApiGenerateContext = await createRestfulApiGenerateContext({
        cwd: options.cwd,
        workspace: options.workspace,
        tsconfigPath: options.tsconfigPath,
        schemaRootPath: options.schemaRootPath,
        apiConfigPath: options.apiConfigPath,
        encoding: options.encoding,
        clean: options.clean,
        muteMissingModel: options.muteMissingModel,
        ignoredDataTypes: options.ignoredDataTypes,
        additionalSchemaArgs: options.additionalSchemaArgs,
        additionalCompilerOptions: options.additionalCompilerOptions,
      })

      const processor = new RestfulApiGenerateProcessor(context)
      await processor.generate()
    } catch (error) {
      handleError(error)
    } finally {
      eventBus.dispatch({ type: EventTypes.EXITING })
    }
  }

  const command = createSubCommandGenerate(packageName, process)
  program.addCommand(command)
}
