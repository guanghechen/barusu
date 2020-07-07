import { ColorfulChalkLogger, INFO } from '@barusu/chalk-logger'
import { CommandOptionConfig } from '@barusu/util-cli'


export const COMMAND_NAME = 'barusu-find-inconsistent'


export const logger = new ColorfulChalkLogger(COMMAND_NAME, {
  level: INFO,
  date: true,
}, process.argv)


export const checkFatalError = (hasError: boolean): never | void => {
  if (hasError) process.exit(-1)
}


/**
 *
 */
export interface CommandOptions extends CommandOptionConfig {
  /**
   * log level
   * @default undefined
   */
  logLevel?: 'debug' | 'verbose' | 'info' | 'warn' | 'error' | string
}


export const defaultCommandOptions: CommandOptions = {
  logLevel: undefined,
}
