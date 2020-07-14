import { ErrorCode } from '../util/error'
import { EventTypes, eventBus } from '../util/event-bus'
import { logger } from '../util/logger'


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
