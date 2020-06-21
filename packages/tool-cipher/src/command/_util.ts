import {
  CommandOptionConfig,
  flatDefaultOptionsFromPackageJson,
} from '@barusu/option-util'
import { name } from '@barusu/tool-cipher/package.json'
import { ERROR_CODE } from '../util/error'
import { logger } from '../util/logger'


/**
 * create default options
 */
export function createDefaultOptions(
  packageJsonPath: string,
  subCommandName?: string,
): CommandOptionConfig {
  const defaultOptions: CommandOptionConfig = {
    logLevel: undefined as unknown as string,
    secretFilepath: '.barusu-secret',
    indexFilepath: '.barusu-index',
    showAsterisk: true,
    plainFilepathPatterns: [],
    cipherFilepathPatterns: [],
  }
  return flatDefaultOptionsFromPackageJson(defaultOptions, packageJsonPath, name, subCommandName)
}


/**
 * handle error
 */
export function handleError(error: Error | any): void {
  const code = error.code || 0
  switch (code) {
    case ERROR_CODE.CANCELED:
      logger.error(error.message)
      process.exit(0)
      break
    case ERROR_CODE.BAD_PASSWORD:
    case ERROR_CODE.ENTERED_PASSWORD_DIFFER:
      logger.error(error.message)
      process.exit(-1)
      break
    default:
      logger.error('error:', error.stack || error.message || error)
      process.exit(-1)
  }
}
