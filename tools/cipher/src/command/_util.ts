import { CommandOptionConfig } from '@barusu/util-cli'
import { ErrorCode } from '../util/error'
import { EventTypes, eventBus } from '../util/event-bus'
import { logger } from '../util/logger'


export interface GlobalCommandOptions extends CommandOptionConfig {
  /**
   * log level
   * @default undefined
   */
  logLevel?: 'debug' | 'verbose' | 'info' | 'warn' | 'error' | string
  /**
   * path of secret file
   * @default .barusu-secret
   */
  secretFilepath: string
  /**
   * path of index of cipher files
   * @default .barusu-index
   */
  indexFilepath: string
  /**
   * whether to print password asterisks
   * @default true
   */
  showAsterisk: boolean
  /**
   * the minimum size required of password
   * @default 6
   */
  miniumPasswordLength: number
}


export const defaultGlobalCommandOptions: GlobalCommandOptions = {
  logLevel: undefined as unknown as string,
  secretFilepath: '.barusu-secret',
  indexFilepath: '.barusu-index',
  showAsterisk: true,
  miniumPasswordLength: 6,
  plainFilepathPatterns: [],
  cipherFilepathPatterns: [],
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
