import { CommandOptionConfig } from '@barusu/util-cli'


export interface GlobalCommandOptions extends CommandOptionConfig {
  /**
   * log level
   * @default undefined
   */
  logLevel?: 'debug' | 'verbose' | 'info' | 'warn' | 'error' | string
}


export const __defaultGlobalCommandOptions: GlobalCommandOptions = {
  logLevel: undefined as unknown as string,
}
