import fs from 'fs-extra'
import { logger } from '../../util/logger'


/**
 * Clear root path of data schemas
 * @param schemaRootPath
 */
export async function clearSchemaRootPath(schemaRootPath: string): Promise<void> {
  const targetDirectory = schemaRootPath
  logger.info(`clearing schemas root path: ${ targetDirectory }.`)
  await fs.remove(targetDirectory)
}
