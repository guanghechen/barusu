import {
  MergeStrategy,
  defaultMergeStrategies,
  isNotEmptyArray,
  isNotEmptyObject,
  isNotEmptyString,
  merge,
} from '@barusu/util-option'
import { loadJsonOrYamlSync } from './fs'


export interface BaseCommandOption {
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
  readonly configFilepath?: string[]
  /**
   * Filepath of parastic config,
   */
  readonly parasticConfig?: string
  /**
   *
   */
  readonly parasticEntry?: string
}


export type CommandOptionConfig = Record<string, unknown>


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
  opts: BaseCommandOption,
  strategies: Partial<Record<keyof C, MergeStrategy>> = {},
  subCommandName?: string,
): C {
  let resolvedConfig = {} as CommandConfig<C>

  // load configs
  if (isNotEmptyArray(opts.configFilepath)) {
    const configs: CommandConfig<C>[] = []
    for (const filepath of opts.configFilepath) {
      const config = loadJsonOrYamlSync(filepath) as CommandConfig<C>
      configs.push(config)
    }
    resolvedConfig = merge<CommandConfig<C>>(configs, {}, defaultMergeStrategies.replace)
  } else { // otherwise, load from parastic config
    if (
      isNotEmptyString(opts.parasticConfig) &&
      isNotEmptyString(opts.parasticEntry)
    ) {
      const config = loadJsonOrYamlSync(opts.parasticConfig) as any
      resolvedConfig = config[opts.parasticEntry] as CommandConfig<C>
    }
  }

  let result: C = defaultOptions

  // merge globalOptions
  if (isNotEmptyObject(resolvedConfig.__globalOptions__)) {
    result = merge<C>(
      [result, resolvedConfig.__globalOptions__],
      strategies,
      defaultMergeStrategies.replace)
  }

  // merge specified sub-command option
  if (
    subCommandName != null &&
    typeof resolvedConfig[subCommandName] == 'object'
  ) {
    result = merge<C>(
      [result, resolvedConfig[subCommandName]],
      strategies,
      defaultMergeStrategies.replace)
  }

  return result
}
