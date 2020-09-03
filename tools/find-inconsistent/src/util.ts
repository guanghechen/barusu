import { CommandConfigurationOptions } from '@barusu/util-cli'


export const checkFatalError = (hasError: boolean): never | void => {
  if (hasError) process.exit(-1)
}


/**
 *
 */
export interface CommandOptions extends CommandConfigurationOptions {
  /**
   * log level
   * @default undefined
   */
  logLevel?: 'debug' | 'verbose' | 'info' | 'warn' | 'error' | string
}


export const defaultCommandOptions: CommandOptions = {
  logLevel: undefined,
}
