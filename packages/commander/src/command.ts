import { EventEmitter } from 'events'
import { Option } from './option'
import { OptionValueProcessor } from './types'


export class Command extends EventEmitter {
  protected _parent: Command | null = null
  protected _name = ''
  protected _version = ''
  protected _description = ''
  protected _usage = ''
  protected _allowUnknownOption = false
  protected readonly _options: Option[] = []

  public constructor() {
    super()
  }

  /**
   * Get / Set the name of the command
   */
  public name(): string
  public name(name: string): this
  public name(name?: string): string | this {
    const self = this
    if (name == null) return self._name
    self._name = name
    return self
  }

  /**
   * Get / Set the command version to `version`
   */
  public version(): string
  public version(version: string, optionStatement?: string, optionDescription?: string): this
  public version(
    version?: string,
    optionStatement = '-V, --version',
    optionDescription = 'output the version number',
  ): string | this {
    const self = this
    if (version == null) return self._version
    self._version = version

    // register version option
    self._registerOption(
      optionStatement, false, optionDescription, this._version)
    return self
  }

  /**
   * Get / Set the command description to `description`.
   */
  public description(): string
  public description(description: string): this
  public description(description?: string): string | this {
    const self = this
    if (description == null) return self._description
    self._description = description
    return self
  }

  /**
   * Get / Set the command usage to `usage`.
   */
  public usage(): string
  public usage(usage: string): this
  public usage(usage?: string): string | this {
    const self = this
    if (usage == null) return self._usage
    self._usage = usage
    return self
  }

  /**
   * Allow unknown options on the command line.
   *
   * @param arg   if `true` or omitted, no error will be thrown
   *              for unknown options.
   */
  public allowUnknownOption(arg: unknown): this {
    this._allowUnknownOption = arg === undefined || Boolean(arg)
    return this
  }

  public command(): Command {
    const subCommand = new Command()
    subCommand._parent = this._parent
    return subCommand
  }

  protected _registerOption<T = unknown>(
    statement: string,
    mandatory: boolean,
    description?: string,
    defaultValue?: T,
    processOptionValue?: OptionValueProcessor<T> | RegExp,
  ): Option {
    const self = this
    const option = new Option<T>(
      statement, mandatory, description, defaultValue)

    let fn: OptionValueProcessor<T> | null = null
    if (processOptionValue instanceof RegExp) {
      const regex: RegExp = processOptionValue
      fn = (newVal, oldVal) => {
        const m = regex.exec(newVal)
        return m == null ? oldVal : m[0] as unknown as T
      }
    } else if (processOptionValue instanceof Function) {
      fn = processOptionValue
    }

    // preassign default value for --no-*, [optional], <required>, or plain flag if boolean value
    if (option.negate || option.optional || option.required || typeof defaultValue === 'boolean') {
      // when --no-foo we make sure default is true, unless a --foo option is already defined
      if (option.negate) {
        // eslint-disable-next-line no-param-reassign
        defaultValue = (option.defaultValue === undefined ? true : option.defaultValue) as unknown as T
      }

      // preassign only if we have a default
      if (defaultValue !== undefined) {
        option.value = defaultValue
      }
    }

    // register the option
    self._options.push(option)

    // when it's passed assign the value
    // and conditionally invoke the callback
    const optionName: string = option.name
    self.on('option:' + optionName, function (val: unknown) {
      // coercion
      if (val !== null && fn != null) {
        // eslint-disable-next-line no-param-reassign
        val = fn(val as string, option.value)
      }

      if (
        typeof option.value === 'boolean' ||
        typeof option.value === 'undefined'
      ) {
        if (val == null) {
          option.value = (option.negate ? false : (defaultValue || true)) as unknown as T
        } else {
          option.value = val as unknown as T
        }
      } else {
        option.value = (option.negate ? false : defaultValue) as unknown as T
      }
    })

    return option
  }
}
