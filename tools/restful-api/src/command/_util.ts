import { CommandOptionConfig } from '@barusu/util-cli'
import { EventTypes, eventBus } from '../util/event-bus'
import { logger } from '../util/logger'


export interface GlobalCommandOptions extends CommandOptionConfig {
  /**
   * log level
   * @default undefined
   */
  logLevel?: 'debug' | 'verbose' | 'info' | 'warn' | 'error' | string
}


export const defaultGlobalCommandOptions: GlobalCommandOptions = {
  logLevel: undefined as unknown as string,
}


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
