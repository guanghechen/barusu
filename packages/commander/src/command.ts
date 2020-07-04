import { EventEmitter } from 'events'
import path from 'path'
import { Argument, parseArgument } from './util/argument'
import { CommandError } from './util/error'
import { Option } from './util/option'


export class Command extends EventEmitter implements Command {
  public readonly parent: Command | null = null
  public readonly args: Argument[] = []
  public readonly options: Option[] = []
  public readonly commands: Command[] = []

  protected _rawArgs: string[] = []
  protected _name = ''
  protected _aliases: string[] = []
  protected _version = ''
  protected _visible = true
  protected _description = ''
  protected _argsDescription: Record<string, string> | null = null
  protected _usage: string | null = null
  protected _allowUnknownOption = false
  protected _actionResults: unknown[] = []
  protected _defaultCommandName: string | null = null
  protected _hasExecutableHandler = false
  protected _executableFile: string | null = null     // custom name for executable
  protected _helpShortFlag = '-h'
  protected _helpLongFlag = '--help'
  protected _helpFlags = '-h, --help'
  protected _helpCommandName = 'help'
  protected _helpCommandNameAndArgs = 'help [command]'
  protected _helpDescription = 'display help for command'
  protected _exitCallback: CommandExitEventCallback | null = null
  protected _actionHandler: ((args: string[]) => void) | null = null

  public constructor(parent?: Command) {
    super()
    if (parent != null) {
      this.parent = parent
      this._helpFlags = parent._helpFlags
      this._helpDescription = parent._helpDescription
      this._helpShortFlag = parent._helpShortFlag
      this._helpLongFlag = parent._helpLongFlag
      this._helpCommandName = parent._helpCommandName
      this._helpCommandNameAndArgs = parent._helpCommandNameAndArgs
      this._helpDescription = parent._helpDescription
      this._exitCallback = parent._exitCallback
      this.parent.commands.push(this)
    }
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
  public command(
    nameAndArgs: string,
    execOptsOrExecDesc?: string | CommandExecOption,
    execOpts?: CommandExecOption,
  ): Command | this {
    const self = this

    let desc: string | null | undefined = execOptsOrExecDesc as string | undefined
    let opts: CommandExecOption = execOpts || {}
    if (typeof desc === 'object' && desc !== null) {
      opts = desc
      desc = null
    }

    const args = nameAndArgs.split(/[\s]+/)
    const subCommand = new Command(self)
    subCommand.name(args.shift())
    subCommand._consumeCommandArguments(args)
    subCommand._visible = !Boolean(opts.hidden)
    subCommand._executableFile = opts.executableFile || null

    if (opts.isDefault) {
      self._defaultCommandName = subCommand._name
    }

    if (desc) {
      subCommand.description(desc)
      subCommand._hasExecutableHandler = true
    }

    return desc == null ? subCommand : this
  }

  // @override
  public addCommand(cmd: Command, opts: CommandExecOption = {}): this | never {
    if (!cmd._name) {
      this._exit(
        1,
        'command.addCommand',
        'Command passed to .addCommand() must have a name')
    }

    const self = this

    // To keep things simple, block automatic name generation for deeply nested executables.
    // Fail fast and detect when adding rather than later when parsing.
    function checkExplicitNames(commands: Command[]): void | never {
      for (const cmd of commands) {
        if (cmd._hasExecutableHandler && !cmd._executableFile) {
          self._exit(
            1,
            'command.addCommand',
            `Must specify executableFile for deeply nested executable: ${ cmd.name() }`)
        }
        checkExplicitNames(cmd.commands)
      }
    }
    checkExplicitNames(cmd.commands)

    if (opts.isDefault) {
      this._defaultCommandName = cmd._name
    }

    if (opts.hidden) {
      // eslint-disable-next-line no-param-reassign
      cmd._visible = false  // modifying passed command due to existing implementation
    }

    // eslint-disable-next-line no-param-reassign
    ; (cmd as any).parent = self
    self.commands.push(cmd)
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
            if (value === undefined) self._missingOptionArgument(option)
            self.emit(`option:${ option.name }`, value)
          } else if (option.optional) {
            let value = null
            // historical behavior is optional value is following arg unless an option
            if (args.length > 0 && !isPotentialOption(args[0])) {
              value = args.shift()
            }
            this.emit(`option:${ option.name }`, value)
          } else { // boolean flag
            this.emit(`option:${ option.name }`)
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

  // @override
  public opts(): Record<string, unknown> {
    const self = this
    const options: Record<string, unknown> = {}
    const nodes: Command[] = [self]
    for (let parent = self.parent; parent != null; parent = parent.parent) {
      nodes.push(parent)
    }

    for (let i = nodes.length - 1; i >= 0; --i) {
      const o = nodes[i]
      for (const option of o.options) {
        options[option.name] = option.value
      }
    }

    return options
  }

  // @override
  public action(fn: CommandActionCallback): this {
    const self = this
    const listener = (args: string[]): void => {
      // The .action callback takes an extra parameter which is the command or options.
      const expectedArgsCount = this.args.length

      // const actionArgs: (string | Record<string, unknown> | string[])[] = [
      const actionArgs: [string[], Record<string, unknown>, string[]] = [
        // Command arguments
        args.slice(0, expectedArgsCount),

        // Command options
        self.opts(),

        // Extra arguments so available too.
        args.slice(expectedArgsCount)
      ]

      const actionResult = fn.apply(this, actionArgs)

      // Remember result in case it is async. Assume parseAsync getting called on root.
      let rootCommand: Command | null = this
      while (rootCommand.parent) {
        rootCommand = rootCommand.parent
      }
      rootCommand._actionResults.push(actionResult)
    }
    self._actionHandler = listener
    return self
  }

  // @override
  public parse(argv: string[], parseOptions: CommandParseOption = {}): this {
    const self = this
    if (argv === undefined || !Array.isArray(argv)) {
      self._exit(1, 'command.parse', 'first parameter to parse must be array')
    }

    // make it a little easier for callers by supporting various argv conventions
    let userArgs: string[]
    let scriptPath: string | null = null
    switch (parseOptions.from) {
      case undefined:
      case 'node':
        scriptPath = argv[1]
        userArgs = argv.slice(2)
        break
      case 'electron':
        if ((process as any).defaultApp) {
          scriptPath = argv[1]
          userArgs = argv.slice(2)
        } else {
          userArgs = argv.slice(1)
        }
        break
      case 'user':
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        userArgs = argv.slice(0)
        break
      default:
        throw new Error(`unexpected parse option { from: '${parseOptions.from}' }`)
    }

    if (scriptPath != null && process.mainModule) {
      scriptPath = process.mainModule.filename
    }

    // Guess name, used in usage in help.
    if (self._name == null && scriptPath != null) {
      self._name = path.basename(scriptPath, path.extname(scriptPath))
    }

    return self
  }

  // override
  public exitOverride(exitCallback: CommandExitEventCallback): this | never {
    const self = this
    if (exitCallback) {
      self._exitCallback = exitCallback
    } else {
      self._exitCallback = (err) => {
        if (err.code !== 'commander.executeSubCommandAsync') {
          throw err
        } else {
          // Async callback from spawn events, not useful to throw.
        }
      }
    }
    return self
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
   * Find command by name
   *
   * @param name
   */
  protected _findCommand(name: string): Command | undefined {
    return this.commands.find(cmd => cmd._name === name || cmd._aliases.includes(name))
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
   * Unknown command.
   */
  protected _unknownCommand(): never {
    const partCommands = [this.name()]
    for (let parentCmd = this.parent; parentCmd; parentCmd = parentCmd.parent) {
      partCommands.unshift(parentCmd.name())
    }
    const fullCommand = partCommands.join(' ')
    const message = `error: unknown command '${ this._rawArgs[0] }'.` +
      ` See '${ fullCommand } ${ this._helpLongFlag }'.`
    console.error(message)
    this._exit(1, 'command._unknownCommand', message)
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
    self._exit(1, 'command._unknownOption', message)
  }

  /**
   * Argument `name` is missing.
   */
  protected _missingCommandArgument(name: string): never {
    const message = `error: missing required argument '${ name }'`
    console.error(message)
    this._exit(1, 'command._missingCommandArgument', message)
  }

  /**
   * `Option` is missing an argument, but received `flag` or nothing.
   *
   * @param option
   */
  protected _missingOptionArgument(option: Option): never {
    const message = `error: option '${ option.flags }' argument missing`
    console.error(message)
    this._exit(1, 'command._missingOptionArgument', message)
  }

  /**
   * `Option` does not have a value, and is a mandatory option.
   *
   * @param option
   */
  protected _missingMandatoryOptionValue(option: Option): never {
    const message = `error: required option '${option.flags}' not specified`
    console.error(message)
    this._exit(1, 'command._missingMandatoryOptionValue', message)
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
          'command._consumeCommandArguments',
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
  protected _exit(exitCode: number, code: string, message: string): never {
    const self = this
    if (self._exitCallback != null) {
      const error = new CommandError(exitCode, code, message)
      self._exitCallback(error)
    }
    process.exit(exitCode)
  }
}


/**
 * Process option value
 * @param newVal  new option value
 * @param oldVal  old option value
 */
export type OptionValueProcessor<T> = (newVal: string, oldVal?: T) => T | undefined


/**
 * Callback for handling the exiting event
 */
export type CommandExitEventCallback = (error: CommandError) => void | never


/**
 *
 */
export interface CommandParseOption {
  /**
   *
   */
  from?: string
}


/**
 * Configuration options that affect Command execution
 */
export interface CommandExecOption {
  /**
   * If true, this command won't shown in the help document
   */
  hidden?: boolean
  /**
   * Supply a custom executable name
   */
  executableFile?: string
  /**
   * Is the default command
   */
  isDefault?: boolean
}


/**
 * Callback for handling the command
 *
 * @param args    command arguments
 * @param options command options
 * @param extra   extra args (neither declared command arguments nor command options)
 */
export type CommandActionCallback = (
  args: string[],
  options: Record<string, unknown>,
  extra: string[],
) => void | Promise<void> | never


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
   * Define a command.
   *
   * There are two styles of command: pay attention to where to put the description.
   *
   * Examples:
   *
   *      // Command implemented using action handler (description is supplied
   *      // separately to `.command`)
   *      program
   *        .command('clone <source> [destination]')
   *        .description('clone a repository into a newly created directory')
   *        .action(([source, destination]) => {
   *          console.log('clone command called');
   *        });
   *
   *      // Command implemented using separate executable file (description is
   *      // second parameter to `.command`)
   *      program
   *        .command('start <service>', 'start named service')
   *        .command('stop [service]', 'stop named service, or all if no name supplied');
   *
   * @param nameAndArgs
   * @param execOptsOrExecDesc
   * @param execOpts
   */
  command(
    nameAndArgs: string,
    execOptsOrExecDesc?: string | CommandExecOption,
    execOpts?: CommandExecOption,
  ): Command | this

  /**
   * Add a prepared sub-command.
   *
   * See .command() for creating an attached sub-command which inherits settings
   * from its parent.
   *
   * @param cmd
   * @param opts
   */
  addCommand(cmd: Command, opts?: CommandExecOption): this | never

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

  /**
   * Return an object containing options as key-value pairs
   */
  opts(): Record<string, unknown>

  /**
   * Register callback `fn` for the command.
   *
   *    fn([cmdArg1, cmdArg2, ...], options, unknownArgs)
   *
   * Examples:
   *
   *      program
   *        .command('help <hhh>, <iii>')
   *        .description('display verbose help')
   *        .option('-p, --pepper')
   *        .action(function([hhh, iii], { pepper }) {
   *           // output help here
   *        })
   *
   * @param fn
   */
  action(fn: CommandActionCallback): this

  /**
   * Parse `argv`, setting options and invoking commands when defined.
   *
   * The default expectation is that the arguments are from node and have the application as argv[0]
   * and the script being run in argv[1], with user parameters after that.
   *
   * Unlike commander.js, you need to specify args explicitly
   *
   * Examples:
   *
   *      program.parse(process.argv);
   *      program.parse(my-args, { from: 'user' }); // just user supplied arguments, nothing special about argv[0]
   *
   * @param argv
   * @param parseOptions
   */
  parse(argv: string[], parseOptions?: CommandParseOption): this

  /**
   * Register callback to use as replacement for calling process.exit
   *
   * @param exitCallback
   */
  exitOverride(exitCallback: CommandExitEventCallback): this | never
}
