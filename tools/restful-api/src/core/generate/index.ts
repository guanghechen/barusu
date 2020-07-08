import { clearSchemaRootPath } from './clear'
import { GenerateCommandContext } from './context'
import { generateDataSchema } from './generate-schema'


/**
 * Initialize a mock server project with templates
 * @param context
 */
export async function generate(context: GenerateCommandContext): Promise<void> {
  // Perform cleanup operations before generate data schemas
  if (context.clean) {
    await clearSchemaRootPath(context.schemaRootPath)
  }

  const tasks: Promise<void>[] = []
  for (const item of context.apiItems) {
    // RequestData
    if (item.request.model != null) {
      const task = generateDataSchema(context, item.request.model, item.request.schema)
      tasks.push(task)
    }

    // ResponseData
    if (item.response.model != null) {
      const task = generateDataSchema(context, item.response.model, item.response.schema)
      tasks.push(task)
    }
  }

  await Promise.all(tasks)
}
