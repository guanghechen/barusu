/**
 *
 */
export interface Logger {
  /**
   * Print debug level log
   * @param messageFormat
   * @param messages
   */
  debug?(messageFormat: string, ...messages: any[]): void
  /**
   * Print verbose level log
   * @param messageFormat
   * @param messages
   */
  verbose?(messageFormat: string, ...messages: any[]): void
  /**
   * Print information level log
   * @param messageFormat
   * @param messages
   */
  info?(messageFormat: string, ...messages: any[]): void
  /**
   * Print warning level log
   * @param messageFormat
   * @param messages
   */
  warn?(messageFormat: string, ...messages: any[]): void
  /**
   * Print error level log
   * @param messageFormat
   * @param messages
   */
  error?(messageFormat: string, ...messages: any[]): void
}
