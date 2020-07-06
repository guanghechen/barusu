import {
  MergeStrategy,
  defaultMergeStrategies,
  isNotEmptyArray,
  isNotEmptyObject,
  isNotEmptyString,
  merge,
} from '@barusu/util-option'
import { loadJsonOrYamlSync } from './fs'


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
      resolvedConfig = config[flatOpts.parasticConfigEntry] as CommandConfig<C>
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
