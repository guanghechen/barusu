/**
 *
 */
export enum CommandErrorCode {
  /**
   * Unknown command
   */
  COMMAND_UNKNOWN = 'command:unknown',
  /**
   * Bad command argument
   */
  COMMAND_ARGUMENT_BAD = 'command.argument:bad',
  /**
   * Bad option
   */
  COMMAND_OPTION_BAD = 'command.option:bad',
  /**
   *
   */
  COMMAND_OPTION_MISSING_ARGUMENT = 'command.option:missing-argument',
  /**
   * Unknown option
   */
  COMMAND_OPTION_UNKNOWN = 'command.option:unknown',
  /**
   * Output help
   */
  COMMAND_HELP = 'command.help',
  /**
   *
   */
  SUB_COMMAND_EXECUTE_ASYNC = 'sub-command:execute-async',
}


/**
 *
 */
export class CommandError extends Error {
  public readonly code: CommandErrorCode
  public readonly exitCode: number
  public nestedError?: Error

  /**
   *
   * @param exitCode  suggested exit code which could be used with process.exit
   * @param code      an id string representing the error
   * @param message   human-readable description of the error
   */
  constructor(exitCode: number, code: CommandErrorCode, message: string) {
    super(message)
    // properly capture stack trace in Node.js
    Error.captureStackTrace(this, this.constructor)
    this.name = this.constructor.name
    this.code = code
    this.exitCode = exitCode
    this.nestedError = undefined
  }
}
