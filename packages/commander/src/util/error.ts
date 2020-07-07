/**
 *
 */
export class CommandError extends Error {
  public readonly code: string
  public readonly exitCode: number
  public nestedError?: Error

  /**
   *
   * @param exitCode  suggested exit code which could be used with process.exit
   * @param code      an id string representing the error
   * @param message   human-readable description of the error
   */
  constructor(exitCode: number, code: string, message: string) {
    super(message)
    // properly capture stack trace in Node.js
    Error.captureStackTrace(this, this.constructor)
    this.name = this.constructor.name
    this.code = code
    this.exitCode = exitCode
    this.nestedError = undefined
  }
}
