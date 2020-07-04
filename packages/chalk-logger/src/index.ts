import { Level } from './level'
import { Logger, Options } from './logger'
export { DEBUG, ERROR, FATAL, INFO, Level, VERBOSE, WARN } from './level'


let registered = false


export class ColorfulChalkLogger extends Logger {
  /**
   * prefix of logger.name
   */
  protected basename: string | null = null

  /**
   * register to commander
   * @param program {commander.Command}
   */
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public static registerToCommander(program: any) {
    // register into commander
    if (!registered) {
      registered = true
      program
        .option('--log-level <level>', 'specify logger\'s level.')
        .option('--log-name <name>', 'specify logger\'s name.')
        .option('--log-mode <\'normal\' | \'loose\'>', 'specify logger\'s name.')
        .option('--log-flag <option>', 'specify logger\' option. [[no-]<date|colorful|inline>]', () => { }, [])
        .option('--log-output <filepath>', 'specify logger\' output path.')
        .option('--log-encoding <encoding>', 'specify output file encoding.')
    }
  }

  /**
   * parse command line args
   * @param options
   * @param args
   */
  private static generateOptions(options?: Options, args?: string[]): Options {
    if (options == null) {
      // eslint-disable-next-line no-param-reassign
      options = {} as Options
    }
    if (args == null) return options

    const levelRegex = /^--log-level\s*[=\s]\s*(\w+)$/
    const nameRegex = /^--log-name\s*[=\s]\s*(\w+)$/
    const modeRegex = /^--log-mode\s*[=\s]\s*(\w+)$/
    const flagRegex = /^--log-flag\s*[=\s]\s*(no-)?(date|inline|colorful)$/
    const outputRegex = /^--log-output\s*[=\s]\s*((['"])[\s\S]+\2|\S+)$/
    const encodingRegex = /^--log-encoding\s*[=\s]\s*([\w\-.]+)$/

    const resolvedArgs: string[] = []
    for (let i = 0; i < args.length; ++i) {
      if (/^--log-\w+$/.test(args[i].trim())) {
        if (i + 1 < args.length && /^[^-]+/.test(args[i + 1].trim())) {
          const arg: string = args[i].trim() + '=' + args[i + 1].trim()
          resolvedArgs.push(arg)
          ++i
        }
      } else if (/^--log-\w+\s*=/.test(args[i].trim())) {
        resolvedArgs.push(args[i])
      }
    }

    resolvedArgs.forEach(arg => {
      if (levelRegex.test(arg)) {
        const [, levelString] = levelRegex.exec(arg) as string[]
        const newLevel = Level.valueOf(levelString)
        if (newLevel == null) return
        if (options!.level == null || newLevel.rank < options!.level!.rank) {
          // eslint-disable-next-line no-param-reassign
          options!.level = newLevel
        }
      }
      if (flagRegex.test(arg)) {
        const [, negative, flag] = flagRegex.exec(arg) as string[]
        // eslint-disable-next-line no-param-reassign
        options![flag] = !negative
      }
      if (encodingRegex.test(arg)) {
        const [, encoding] = levelRegex.exec(arg) as string[]
        // eslint-disable-next-line no-param-reassign
        options!.encoding = encoding
      }
      if (outputRegex.test(arg)) {
        let [, filepath] = outputRegex.exec(arg) as string[]
        if (/^['"]([\s\S]+)['"]$/.test(filepath)) filepath = /^['"]([\s\S]+)['"]$/.exec(filepath)![1]
        // eslint-disable-next-line no-param-reassign
        options!.filepath = filepath
      }
      if (nameRegex.test(arg)) {
        const [, nameString] = nameRegex.exec(arg) as string[]
        if (nameString == null) return
        // eslint-disable-next-line no-param-reassign
        options!.name = nameString
      }
      if (modeRegex.test(arg)) {
        const [, modeString] = modeRegex.exec(arg) as string[]
        if (modeString == null) return
        if (!/^normal|loose$/i.test(modeString)) return
        // eslint-disable-next-line no-param-reassign
        options!.mode = modeString.toLowerCase() as 'normal' | 'loose'
      }
    })

    return options
  }

  public readonly registerToCommander = ColorfulChalkLogger.registerToCommander

  constructor(basename: string, options?: Options, args?: string[]) {
    super(basename, ColorfulChalkLogger.generateOptions(options, args))
    this.setBaseName(basename)
  }

  /**
   * update logger's level
   * @param level
   */
  public setLevel(level: Level | null | undefined): void {
    if (level == null) return
    this.level = level
  }

  /**
   * update logger's name
   * @param name
   */
  public setName(name: string): void {
    const resolvedName: string = [this.basename, name]
      .filter((x): x is string => x != null && x.length > 0)
      .join(' ')
    this.name = resolvedName
  }

  /**
   * update basename of logger
   * @param basename
   */
  public setBaseName(basename: string | null): void {
    this.basename = basename
  }

  /**
   * update logger's mode
   * @param mode
   */
  public setMode(mode: 'normal' | 'loose'): void {
    this.mode = mode
  }
}
