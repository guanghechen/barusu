import { EventEmitter } from 'events'
import { Argument, parseArgument } from './util/argument'
import { CommandError, CommandErrorCode } from './util/error'
import { Option } from './util/option'


/**
 * Process option value
 * @param newVal  new option value
 * @param oldVal  old option value
 */
export type OptionValueProcessor<T> = (newVal: string, oldVal?: T) => T | undefined


/**
 * Handling exit event
 */
export type CommandExitEventHandler = (error: CommandError) => void | never


export class Command extends EventEmitter implements Command {
  public readonly parent: Command | null = null
  public readonly args: Argument[] = []
  public readonly options: Option[] = []
  public readonly commands: Command[] = []

  protected _name = ''
  protected _aliases: string[] = []
  protected _version = ''
  protected _visible = true
  protected _description = ''
  protected _argsDescription: Record<string, string> | null = null
  protected _usage: string | null = null
  protected _allowUnknownOption = false
  protected _helpShortFlag = '-h'
  protected _helpLongFlag = '--help'
  protected _helpFlags = '-h, --help'
  protected _helpCommandName = 'help'
  protected _helpCommandNameAndArgs = 'help [command]'
  protected _helpDescription = 'display help for command'
  protected _exitCallback: CommandExitEventHandler | null = null

  public constructor(parent?: Command) {
    super()
    if (parent != null) this.parent = parent
  }

  // @override
  public name(name?: string): string | this {
    const self = this
    if (name === undefined) return self._name
    self._name = name
    return self
  }

  // @override
  public alias(alias?: string): string | this {
    const self = this
    if (alias === undefined) return self._aliases[0]

    if (alias === self._name) {
      throw new Error('Command alias can\'t be the same as its name')
    }

    self._aliases.push(alias)
    return self
  }

  // @override
  public aliases(aliases?: string[]): string[] | this {
    const self = this
    if (aliases === undefined) return self._aliases

    aliases.forEach((alias) => self.alias(alias))
    return self
  }

  // @override
  public version(
    version?: string,
    optionFlags = '-V, --version',
    optionDescription = 'output the version number',
  ): string | this {
    const self = this
    if (version === undefined) return self._version
    self._version = version

    // register version option
    self._registerOption(
      optionFlags, false, optionDescription, this._version)
    return self
  }

  // @override
  public description(
    description?: string,
    argsDescription?: Record<string, string>
  ): string | this {
    const self = this
    if (description === undefined && argsDescription === undefined) {
      return self._description
    }

    if (description != null) self._description = description
    if (argsDescription != null) self._argsDescription = argsDescription
    return self
  }

  // @override
  public usage(usage?: string): string | this {
    const self = this
    if (usage === undefined) {
      if (self._usage != null) return self._usage
      const args = this.args.map(arg => arg.friendlyDesc)
      return '[options]' +
        (this.commands.length > 0 ? ' [command]' : '') +
        (args.length > 0 ? ' ' + args.join(' ') : '')
    }
    self._usage = usage
    return self
  }

  // @override
  public arguments(flags: string): this {
    const self = this
    self._consumeCommandArguments(flags.split(/[\s]+/))
    return this
  }

  // @override
  public option<T = unknown>(
    flags: string,
    description?: string,
    defaultValue?: T,
    processOptionValue?: OptionValueProcessor<T> | RegExp,
  ): this {
    const self = this
    self._registerOption<T>(
      flags, false, description, defaultValue, processOptionValue)
    return self
  }

  // @override
  public requiredOption<T = unknown>(
    flags: string,
    description?: string,
    defaultValue?: T,
    processOptionValue?: OptionValueProcessor<T> | RegExp,
  ): this {
    const self = this
    self._registerOption<T>(
      flags, true, description, defaultValue, processOptionValue)
    return self
  }

  // @override
  public allowUnknownOption(arg: unknown): this {
    const self = this
    self._allowUnknownOption = arg === undefined || Boolean(arg)
    return self
  }

  // @override
  public parseOptions(argv: string[]): { operands: string[], unknown: string[] } {
    const self = this
    const args = argv.slice()
    const operands: string[] = []
    const unknown: string[] = []

    const isPotentialOption = (arg: string): boolean => arg.length > 1 && arg[0] === '-'

    let dest = operands
    while (args.length > 0) {
      const arg = args.shift()!

      // literal
      if (arg === '--') {
        if (dest === unknown) dest.push(arg)
        dest.push(...args)
      }

      if (isPotentialOption(arg)) {
        const option = self._findOption(arg)

        // recognised option, call listener to assign value with possible custom processing
        if (option != null) {
          if (option.required) {
            const value = args.shift()
            if (value === undefined) self._optionMissingArgument(option)
            self.emit(`option:${ option.name }`, value)
          } else if (option.optional) {
            let value = null
            // historical behavior is optional value is following arg unless an option
            if (args.length > 0 && !isPotentialOption(args[0])) {
              value = args.shift()
            }
            this.emit(`option:${option.name}`, value)
          } else { // boolean flag
            this.emit(`option:${option.name}`)
          }
          continue
        }
      }

      // Look for combo options following single dash, eat first one if known.
      if (arg.length > 2 && arg[0] === '-' && arg[1] !== '-') {
        const option = this._findOption(`-${ arg[1] }`)
        if (option) {
          if (option.required || option.optional) {
            // option with value following in same argument
            this.emit(`option:${ option.name }`, arg.slice(2))
          } else {
            // boolean option, emit and put back remainder of arg for further processing
            this.emit(`option:${ option.name }`)
            args.unshift(`-${ arg.slice(2) }`)
          }
          continue
        }
      }

      // Look for known long flag with value, like --foo=bar
      if (/^--[^=]+=/.test(arg)) {
        const index = arg.indexOf('=')
        const option = this._findOption(arg.slice(0, index))
        if (option != null && (option.required || option.optional)) {
          this.emit(`option:${ option.name }`, arg.slice(index + 1))
          continue
        }
      }

      // looks like an option but unknown, unknowns from here
      if (arg.length > 1 && arg[0] === '-') {
        dest = unknown
      }

      // add arg
      dest.push(arg)
    }

    return { operands, unknown }
  }

  public command(): Command {
    const self = this
    const subCommand = new Command(self)
    subCommand._exitCallback = self._exitCallback
    return subCommand
  }

  /**
   * Register callback to use as replacement for calling process.exit
   * @param exitCallback
   */
  public exitOverride(exitCallback: CommandExitEventHandler): this {
    if (exitCallback) {
      this._exitCallback = exitCallback
    } else {
      this._exitCallback = (err) => {
        if (err.code !== CommandErrorCode.SUB_COMMAND_EXECUTE_ASYNC) {
          throw err
        } else {
          // Async callback from spawn events, not useful to throw.
        }
      }
    }
    return this
  }

  /**
   * Return prepared commands details.
   */
  protected _preparedCommandsDetails(): [string, string][] {
    const commandDetails = this.commands
      .filter((cmd) => cmd._visible)
      .map((cmd): [string, string] => {
        const args = cmd.args.map((arg) => arg.friendlyDesc).join(' ')
        return [
          cmd._name +
          (cmd._aliases[0] ? '|' + cmd._aliases[0] : '') +
          (cmd.options.length ? ' [options]' : '') +
          (args ? ' ' + args : ''),
          cmd._description
        ]
      })
    return commandDetails
  }

  /**
   * Find command by name
   *
   * @param name
   */
  protected _findCommand(name: string): Command | undefined {
    return this.commands.find(cmd => cmd._name === name || cmd._aliases.includes(name))
  }

  /**
   * Unknown command.
   */
  protected _unknownCommand(): never {
    const partCommands = [this.name()]
    for (let parentCmd = this.parent; parentCmd; parentCmd = parentCmd.parent) {
      partCommands.unshift(parentCmd.name())
    }
    const fullCommand = partCommands.join(' ')
    const message = `error: unknown command '${ this.args[0] }'. See '${ fullCommand } ${ this._helpLongFlag }'.`
    console.error(message)
    this._exit(1, CommandErrorCode.COMMAND_UNKNOWN, message)
  }

  /**
   * Find option matching `arg` if any
   *
   * @param name
   */
  protected _findOption(arg: string): Option | undefined {
    return this.options.find(option => option.is(arg))
  }

  /**
   *
   * @param flags
   * @param mandatory
   * @param description
   * @param defaultValue
   * @param processOptionValue
   */
  protected _registerOption<T = unknown>(
    flags: string,
    mandatory: boolean,
    description?: string,
    defaultValue?: T,
    processOptionValue?: OptionValueProcessor<T> | RegExp,
  ): Option {
    const self = this
    const option = new Option<T>(
      flags, mandatory, description, defaultValue)

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
    self.options.push(option)

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

  /**
   * Unknown option `flags`
   * @param flags
   */
  protected _unknownOption(flags: string): void | never {
    const self = this
    if (self._allowUnknownOption) return
    const message = `error: unknown option '${ flags }'`
    console.error(message)
    self._exit(1, CommandErrorCode.COMMAND_OPTION_UNKNOWN, message)
  }

  /**
   * `Option` is missing an argument, but received `flag` or nothing.
   *
   * @param option
   */
  protected _optionMissingArgument(option: Option): never {
    const message = `error: option '${ option.flags }' argument missing`
    console.error(message)
    this._exit(1, CommandErrorCode.COMMAND_OPTION_MISSING_ARGUMENT, message)
  }

  /**
   * Parse expected `args`.
   *
   * For example `["[type]"]` becomes `[{ required: false, name: 'type' }]`.
   * @param args
   */
  protected _consumeCommandArguments(args: string[]): void {
    if (args.length <= 0) return

    const self = this
    for (const arg of args) {
      const argDetail: Argument | null = parseArgument(arg)
      if (argDetail == null) continue
      self.args.push(argDetail)
    }

    // Verify the arguments definition is correct
    for (let i = 0; i < self.args.length; ++i) {
      const arg = self.args[i]
      if (arg.variadic && i < self.args.length) {
        throw new CommandError(
          -1,
          CommandErrorCode.COMMAND_ARGUMENT_BAD,
          `Only the last argument can be variadic '${ arg.name }'`)
      }
    }
  }

  /**
   * Call process.exit, and _exitCallback if defined
   * @param exitCode  exit code for using with process.exit
   * @param code      an id string representing the error
   * @param message   human-readable description of the error
   */
  protected _exit(exitCode: number, code: CommandErrorCode, message: string): never {
    const self = this
    if (self._exitCallback != null) {
      const error = new CommandError(exitCode, code, message)
      self._exitCallback(error)
    }
    process.exit(exitCode)
  }
}


export interface Command extends EventEmitter {
  readonly parent: Command | null
  readonly args: Argument[]
  readonly options: Option[]
  readonly commands: Command[]

  /**
   * Get / Set the name of the command
   */
  name(): string
  name(name: string): this

  /**
   * Get / Set alias for the command
   *
   * You may call more than once to add multiple aliases.
   * Only the first alias is shown in the auto-generated help.
   */
  alias(): string
  alias(alias: string): this

  /**
   * Get / Set the aliases of the command
   *
   * Getter for the array of aliases is the main reason for having
   * aliases() in addition to alias().
   */
  aliases(): string[]
  aliases(aliases?: string[]): this

  /**
   * Get / Set the command version to `version`
   */
  version(): string
  version(
    version: string,
    optionFlags?: string,
    optionDescription?: string
  ): this

  /**
   * Get / Set the command description to `description`.
   */
  description(): string
  description(
    description: string,
    argsDescription?: Record<string, string>
  ): this

  /**
   * Get / Set the command usage to `usage`.
   */
  usage(): string
  usage(usage: string): this

  /**
   * Define argument syntax for the command.
   *
   * @param flags
   */
  arguments(flags: string): this

  /**
   * Define option with `flags`, `description`, `defaultValue` and optional
   * coercion `processOptionValue`.
   *
   * The `flags` string should contain both the short and long flags,
   * separated by comma, a pipe or space. The following are all valid
   * all will output this way when `--help` is used.
   *
   *    "-p, --pepper"
   *    "-p|--pepper"
   *    "-p --pepper"
   *
   * Examples
   *
   *     // --pepper is an boolean flag without argument
   *    .option('-p, --pepper', 'use pepper')
   *
   *    // --no-pepper is an negate boolean flag without argument
   *    // That's means once you specified this option, you can
   *    // get `.pepper = false`
   *    .option(--no-pepper', 'don\'t use pepper')
   *
   *    // --pepper has an optional argument
   *    .option('-p, --pepper [pepper]', 'add pepper [pepper]')
   *
   *    // --pepper has a required argument
   *    .option('-p, --pepper <pepper>', 'add pepper <pepper>')
   *
   * @param flags
   * @param description
   * @param defaultValue
   * @param processOptionValue
   */
  option<T = unknown>(
    flags: string,
    description?: string,
    defaultValue?: T,
    processOptionValue?: OptionValueProcessor<T> | RegExp,
  ): this

  /**
   * Add a required option which must have a value after parsing. This usually
   * means the option must be specified on the command line. (Otherwise the
   * same as .option().)
   *
   * @param flags
   * @param description
   * @param defaultValue
   * @param processOptionValue
   */
  requiredOption<T = unknown>(
    flags: string,
    description?: string,
    defaultValue?: T,
    processOptionValue?: OptionValueProcessor<T> | RegExp,
  ): this

  /**
   * Allow unknown options on the command line.
   *
   * @param arg   if `true` or omitted, no error will be thrown
   *              for unknown options.
   */
  allowUnknownOption(arg: unknown): this

  /**
   * Parse options from `argv` removing known options,
   * and return argv split into operands and unknown arguments.
   *
   * Examples:
   *
   *    argv => operands, unknown
   *    --known kkk op => [op], []
   *    op --known kkk => [op], []
   *    sub --unknown uuu op => [sub], [--unknown uuu op]
   *    sub -- --unknown uuu op => [sub --unknown uuu op], []
   *
   * @param argv
   */
  parseOptions(argv: string[]): { operands: string[], unknown: string[] }
}
