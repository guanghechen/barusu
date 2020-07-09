import path from 'path'
import { ColorfulChalkLogger, Level } from '@barusu/chalk-logger'
import {
  MergeStrategy,
  cover,
  coverString,
  defaultMergeStrategies,
  isNotEmptyArray,
  isNotEmptyObject,
  isNotEmptyString,
  merge,
} from '@barusu/util-option'
import { loadJsonOrYamlSync } from './fs'
import { findPackageJsonPath } from './manifest'


export interface ConfigFlatOpts {
  /**
   * Path of currently executing command
   */
  readonly cwd: string
  /**
   * Working directory
   */
  readonly workspace: string
  /**
   * Filepath of configs, only *.yml, *.yaml and *.json are supported.
   * Each configuration file can specify the same options, the configuration
   * file specified later can override the configuration specified previous.
   * @default []
   */
  readonly configPath?: string[]
  /**
   * Filepath of parastic config,
   */
  readonly parasticConfigPath?: string | null
  /**
   * The entry key of options in the parasitic configuration file
   */
  readonly parasticConfigEntry?: string | null
}


export interface CommandOptionConfig extends Record<string, unknown> {
  /**
   * log level
   * @default undefined
   */
  readonly logLevel?: 'debug' | 'verbose' | 'info' | 'warn' | 'error' | string
  /**
   * Filepath of configs, only *.yml, *.yaml and *.json are supported.
   * Each configuration file can specify the same options, the configuration
   * file specified later can override the configuration specified previous.
   * @default []
   */
  readonly configPath?: string[]
  /**
   * Filepath of parastic config,
   */
  readonly parasticConfigPath?: string | null
  /**
   * The entry key of options in the parasitic configuration file
   */
  readonly parasticConfigEntry?: string | null
}


export interface CommandConfig<C extends CommandOptionConfig> {
  /**
   * Global options shared by all sub-commands
   */
  __globalOptions__: C
  /**
   * Sub-command specific options
   */
  [subCommand: string]: C
}


/**
 * Flat defaultOptions with configs from package.json
 */
export function flagDefaultOptions<C extends CommandOptionConfig>(
  defaultOptions: C,
  flatOpts: ConfigFlatOpts,
  subCommandName: string | false,
  strategies: Partial<Record<keyof C, MergeStrategy>> = {},
): C {
  let resolvedConfig = {} as CommandConfig<C>

  // load configs
  if (isNotEmptyArray(flatOpts.configPath)) {
    const configs: CommandConfig<C>[] = []
    for (const filepath of flatOpts.configPath) {
      const config = loadJsonOrYamlSync(filepath) as CommandConfig<C>
      configs.push(config)
    }
    resolvedConfig = merge<CommandConfig<C>>(configs, {}, defaultMergeStrategies.replace)
  } else { // otherwise, load from parastic config
    if (
      isNotEmptyString(flatOpts.parasticConfigPath) &&
      isNotEmptyString(flatOpts.parasticConfigEntry)
    ) {
      const config = loadJsonOrYamlSync(flatOpts.parasticConfigPath) as any
      resolvedConfig = config[flatOpts.parasticConfigEntry] as CommandConfig<C> || {}
    }
  }

  let result: C = defaultOptions

  if (subCommandName === false) {
    result = merge<C>([result, resolvedConfig as unknown as C],
      strategies,
      defaultMergeStrategies.replace)
  } else {
    // merge globalOptions
    if (isNotEmptyObject(resolvedConfig.__globalOptions__)) {
      result = merge<C>(
        [result, resolvedConfig.__globalOptions__],
        strategies,
        defaultMergeStrategies.replace)
    }

    // merge specified sub-command option
    if (
      isNotEmptyString(subCommandName) &&
      typeof resolvedConfig[subCommandName] == 'object'
    ) {
      result = merge<C>(
        [result, resolvedConfig[subCommandName]],
        strategies,
        defaultMergeStrategies.replace)
    }
  }

  return result
}


export function resolveCommandOptions<
  C extends Partial<CommandOptionConfig>,
  D extends CommandOptionConfig,
>(
  logger: ColorfulChalkLogger,
  commandName: string,
  subCommandName: string | false,
  defaultOptions: D,
  workspaceDir: string,
  options: C,
  strategies: Partial<Record<keyof D, MergeStrategy>> = {},
): D {
  const cwd: string = path.resolve()
  const workspace: string = path.resolve(cwd, workspaceDir)
  const configPath: string[] = options.configPath!.map((p: string) => path.resolve(workspace, p))
  const parasticConfigPath: string | null | undefined = cover<string | null>(
    (): string | null => findPackageJsonPath(workspace),
    options.parasticConfigPath)
  const parasticConfigEntry: string = coverString(commandName, options.parasticConfigEntry)
  const flatOpts: ConfigFlatOpts = {
    cwd,
    workspace,
    configPath,
    parasticConfigPath,
    parasticConfigEntry,
  }

  const resolvedOptions = flagDefaultOptions<D>(
    defaultOptions,
    flatOpts,
    subCommandName,
    strategies,
  )

  // reset log-level
  const logLevel = cover<string | undefined>(resolvedOptions.logLevel, options.logLevel)
  if (logLevel != null) {
    const level = Level.valueOf(logLevel)
    if (level != null) logger.setLevel(level)
  }

  logger.debug('cwd:', flatOpts.cwd)
  logger.debug('workspace:', flatOpts.workspace)
  logger.debug('configPath:', flatOpts.configPath)
  logger.debug('parasticConfigPath:', flatOpts.parasticConfigPath)
  logger.debug('parasticConfigEntry:', flatOpts.parasticConfigEntry)

  return {
    ...resolvedOptions,
    logLevel,
  }
}
