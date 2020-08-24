import { SimpleEventBus } from '@barusu/event-bus'
import { logger } from '../index'


export enum EventTypes {
  /**
   * Cancelled, exit program
   */
  CANCELED = 'CANCELED',
  /**
   * Exiting, exiting program
   */
  EXITING = 'EXITING',
}


export const eventBus = new SimpleEventBus<EventTypes>()


eventBus.on(EventTypes.CANCELED, function () {
  logger.info('canceled')
  logger.debug('canceled.')
  eventBus.dispatch({ type: EventTypes.EXITING })
})


eventBus.on(EventTypes.EXITING, function () {
  setTimeout(() => {
    process.exit(0)
  }, 0)
})


/**
 * handle error
 */
export function handleError(error: Error | any): void {
  const code = error.code || 0
  switch (code) {
    default:
      logger.error('error:', error.stack || error.message || error)
      eventBus.dispatch({ type: EventTypes.EXITING })
      break
  }
}
