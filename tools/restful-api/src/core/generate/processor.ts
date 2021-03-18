import type * as TJS from '@barusu/typescript-json-schema'
import { mkdirsIfNotExists } from '@barusu/util-cli'
import fs from 'fs-extra'
import { logger } from '../../env/logger'
import type { RestfulApiGenerateContext } from './context'
import { clearSchemaRootPath, removeIgnoredDataTypes } from './util'

export class RestfulApiGenerateProcessor {
  protected readonly context: RestfulApiGenerateContext

  constructor(context: RestfulApiGenerateContext) {
    this.context = context
  }

  /**
   *
   */
  public async generate(): Promise<void> {
    const self = this
    const { context } = self

    // Perform cleanup operations before generate data schemas
    if (context.clean) {
      await clearSchemaRootPath(context.schemaRootPath)
    }

    const tasks: Array<Promise<void>> = []
    for (const item of context.apiItems) {
      // RequestData
      if (item.request.model != null && item.request.schemaPath != null) {
        const task = self.generateDataSchema(
          item.request.model,
          item.request.schemaPath,
        )
        tasks.push(task)
      }

      // ResponseData
      if (item.response.model != null) {
        const task = self.generateDataSchema(
          item.response.model,
          item.response.schemaPath,
        )
        tasks.push(task)
      }
    }

    await Promise.all(tasks)
  }

  public async generateDataSchema(
    modelName: string,
    schemaPath: string,
  ): Promise<void> {
    const { context } = this
    const symbols = context.generator.getSymbols(modelName)
    if (symbols.length <= 0) {
      // If the model is not found and muteMissingModel are set to true, skipped
      if (context.muteMissingModel) {
        logger.info(`cannot find ${modelName}. skipped.`)
        return
      }
      throw new Error(`${modelName} not found.`)
    }

    // If no title is specified, the model name is the title
    const model: TJS.Definition = context.generator.getSchemaForSymbol(
      modelName,
    )
    if (model.title == null) model.title = modelName

    // Make sure the folder on the output path has been created
    mkdirsIfNotExists(schemaPath, false)

    // Serialize the Model
    const json = removeIgnoredDataTypes(model, context.ignoredDataTypes)
    const data = JSON.stringify(json, null, 2)

    await fs.writeFile(schemaPath, data, context.encoding)
    logger.info(`output schema: [${modelName}] ${schemaPath}`)
  }
}
