import fs from 'fs-extra'


export interface CommandOptionConfig {
  [key: string]: any
}


export interface CommandConfig {
  /**
   * Global options shared by all sub-commands
   */
  __globalOptions__: CommandOptionConfig
  /**
   * Sub-command specific options
   */
  [subCommand: string]: CommandOptionConfig
}


/**
 * Flat defaultOptions with configs from package.json
 */
export function flatDefaultOptionsFromPackageJson(
  defaultOptions: CommandOptionConfig,
  packageJsonPath: string,
  packageName: string,
  subCommandName?: string,
): typeof defaultOptions & CommandOptionConfig {
  if (!fs.existsSync(packageJsonPath)) return defaultOptions

  // load command config from package.json
  const packageJson = fs.readJSONSync(packageJsonPath)
  const commandConfig: CommandConfig = packageJson[packageName]
  if (commandConfig == null || typeof commandConfig !== 'object') {
    return defaultOptions
  }

  let result = defaultOptions

  // merge globalOptions
  if (typeof commandConfig.__globalOptions__ === 'object') {
    result = { ...result, ...commandConfig.__globalOptions__ }
  }

  // merge specified sub-command option
  if (
    subCommandName != null &&
    typeof commandConfig[subCommandName] == 'object'
  ) {
    result = { ...result, ...commandConfig[subCommandName] }
  }

  return result
}


export function parseOption<T>(
  defaultValue: T,
  optionValue: T | null | undefined,
  isOptionValueValid?: (t: T | null | undefined) => boolean,
): T {
  const valid = isOptionValueValid != null
    ? isOptionValueValid(optionValue)
    : optionValue != null
  return valid ? optionValue! : defaultValue
}
