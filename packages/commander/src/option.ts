import { CustomError, ErrorCode } from './types'


/**
 * -x, -xxxx [args]
 * -x, -xxxx <args>
 */
export const optionStatementRegex = new RegExp(
  /^\s*/.source +
  /(\-[a-zA-Z])?/.source +                                          // short
  /([, |]\s*)?/.source +
  /(\-\-[a-zA-Z](?:[a-zA-Z\-\d]+[a-zA-Z\d])?[a-zA-Z\d]*)?/.source + // long
  /\s*/.source +
  /(\[[^\]]*\]|\<[^\>]*\>)?/.source +                               // option arg
  /\s*$/.source
)


/**
 * Transform option arg to camel case
 * @param optionArg
 */
export function transformOptionArgToCamelCase(optionArg: string): string {
  return optionArg.split('-').reduce((s, w) => s + w[0].toUpperCase() + w.slice(1))
}


/**
 * @member name           Option name
 * @member argName        Option arg name
 * @member statement      Raw option declaration statement
 * @member mandatory      Is a required option
 * @member description    Option description
 * @member negate         Negative option
 * @member required       Has a required parameter
 * @member optional       Has a optional parameter
 * @member short          Short name of option
 * @member long           Long / Full name of option
 * @member defaultValue   Option default value
 */
export class Option<T = unknown> {
  public readonly name: string
  public readonly argName: string
  public readonly statement: string
  public readonly mandatory: boolean
  public readonly description: string
  public readonly negate: boolean
  public readonly required: boolean
  public readonly optional: boolean
  public readonly short?: string
  public readonly long?: string
  public readonly defaultValue?: T
  public value?: T

  public constructor(
    statement: string,
    mandatory: boolean,
    description?: string,
    defaultValue?: T
  ) {
    const match = optionStatementRegex.exec(statement)
    if (match == null) {
      const err: CustomError = {
        code: ErrorCode.BAD_OPTION,
        message: `Not a valid option flags(${ statement })`
      }
      throw err
    }

    const [, short, , long, optionArg] = match
    if (short == null && long == null) {
      const err: CustomError = {
        code: ErrorCode.BAD_OPTION,
        message: `Not a valid option flags(${ statement }). Bad option name`
      }
      throw err
    }

    this.statement = statement
    this.mandatory = mandatory
    this.description = description || ''
    this.defaultValue = defaultValue
    this.name = long != null ? long.replace(/^--/, '') : short.replace(/^-/, '')
    this.argName = transformOptionArgToCamelCase(this.name.replace(/^no-([^\-]))?/, '$1'))
    this.negate = long == null || /^--(?:no-([^\-]))?/.test(long)
    this.required = optionArg != null && optionArg[0] === '<'
    this.optional = optionArg != null && optionArg[0] === '['
    this.short = short
    this.long = long
    this.value = undefined
  }

  /**
   *
   * @param arg
   */
  public is(arg: string): boolean {
    return this.short === arg || this.long === arg
  }
}
