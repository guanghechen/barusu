import { CommandError } from './error'


/**
 * -x, -xxxx [args]
 * -x, -xxxx <args>
 */
export const optionFlagsRegex = new RegExp(
  /^\s*/.source +
  /(-[a-zA-Z])?/.source +                                           // short
  /([, |]\s*)?/.source +
  /(--[a-zA-Z](?:[a-zA-Z\-\d]+[a-zA-Z\d])?[a-zA-Z\d]*)?/.source +   // long
  /\s*/.source +
  /(\[[^\]]*\]|<[^>]*>)?/.source +                                  // option arg
  /\s*$/.source
)


/**
 * Transform option arg to camel case
 * @param optionArg
 */
export function transformOptionArgToCamelCase(optionArg: string): string {
  return optionArg.split('-').reduce((s, w) => s + w[0].toUpperCase() + w.slice(1))
}


export class Option<T = unknown> implements Option<T> {
  public readonly name: string
  public readonly argName: string
  public readonly flags: string
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
    flags: string,
    mandatory: boolean,
    description?: string,
    defaultValue?: T
  ) {
    const match = optionFlagsRegex.exec(flags)
    if (match == null) {
      throw new CommandError(
        -1,
        'Option.constructor:illegal option',
        `Not a valid option flags(${ flags })`
      )
    }

    const [, short, , long, optionArg] = match
    if (short == null && long == null) {
      throw new CommandError(
        -1,
        'Option.constructor:illegal option',
        `Not a valid option flags(${ flags }). Bad option name`
      )
    }

    this.flags = flags
    this.mandatory = mandatory
    this.description = description || ''
    this.defaultValue = defaultValue
    this.name = long != null ? long.replace(/^--/, '') : short.replace(/^-/, '')
    this.argName = transformOptionArgToCamelCase(this.name.replace(/^(no-([^-]))?/, '$1'))
    this.negate = long == null || /^--(?:no-([^-]))?/.test(long)
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


/**
 *
 */
export interface Option<T = unknown> {
  /**
   * Raw option declaration flags
   */
  readonly flags: string
  /**
   * Option name
   */
  readonly name: string
  /**
   * Option arg name
   */
  readonly argName: string
  /**
   * Is a required option
   */
  readonly mandatory: boolean
  /**
   * Option description
   */
  readonly description: string
  /**
   * Negative option
   */
  readonly negate: boolean
  /**
   * Has a required parameter
   */
  readonly required: boolean
  /**
   * Has a optional parameter
   */
  readonly optional: boolean
  /**
   * Short name of option
   */
  readonly short?: string
  /**
   * Long / Full name of option
   */
  readonly long?: string
  /**
   * Option default value
   */
  readonly defaultValue?: T
  /**
   *
   */
  value?: T
  /**
   *
   * @param arg
   */
  is(arg: string): boolean
}
