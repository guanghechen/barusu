import {
  CommandOptionConfig,
  flatDefaultOptionsFromPackageJson,
} from '@barusu/option-util'
import { name } from '@barusu/tool-cipher/package.json'
import { ErrorCode } from '../util/error'
import { EventTypes, eventBus } from '../util/event-bus'
import { logger } from '../util/logger'


/**
 * create default options
 */
export function createDefaultOptions(
  packageJsonPath: string,
  subCommandName?: string,
  subCommandDefaultOptions?: CommandOptionConfig,
): CommandOptionConfig {
  const defaultOptions: CommandOptionConfig = {
    logLevel: undefined as unknown as string,
    secretFilepath: '.barusu-secret',
    indexFilepath: '.barusu-index',
    showAsterisk: true,
    miniumPasswordLength: 6,
    plainFilepathPatterns: [],
    outDir: 'out',
    ...subCommandDefaultOptions,
  }
  return flatDefaultOptionsFromPackageJson(defaultOptions, packageJsonPath, name, subCommandName)
}


/**
 * handle error
 */
export function handleError(error: Error | any): void {
  const code = error.code || 0
  switch (code) {
    case ErrorCode.BAD_PASSWORD:
    case ErrorCode.ENTERED_PASSWORD_DIFFER:
      logger.error(error.message)
      eventBus.dispatch({ type: EventTypes.EXITING })
      break
    default:
      logger.error('error:', error.stack || error.message || error)
      eventBus.dispatch({ type: EventTypes.EXITING })
      break
  }
}
