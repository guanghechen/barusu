export interface Logger {
  debug?(messageFormat: string, ...messages: any[]): void

  verbose?(messageFormat: string, ...messages: any[]): void

  info?(messageFormat: string, ...messages: any[]): void

  warn?(messageFormat: string, ...messages: any[]): void

  error?(messageFormat: string, ...messages: any[]): void
}
