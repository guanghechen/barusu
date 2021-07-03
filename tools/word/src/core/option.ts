import type {
  CommandConfigurationFlatOpts,
  CommandConfigurationOptions,
  MergeStrategy,
} from '@guanghechen/commander-helper'
import { resolveCommandConfigurationOptions } from '@guanghechen/commander-helper'
import { cover, isNonBlankString } from '@guanghechen/option-helper'
import { logger } from '../env/logger'

/**
 * Global command options
 */
export interface GlobalCommandOptions extends CommandConfigurationOptions {
  /**
   * default encoding of files in the workspace
   * @default utf-8
   */
  encoding: string
}

/**
 * Default value of global options
 */
export const __defaultGlobalCommandOptions: GlobalCommandOptions = {
  encoding: 'utf-8',
}

/**
 *
 * @param flatOpts
 * @param subCommandName
 * @param strategies
 */
export function resolveGlobalCommandOptions<C extends Record<string, unknown>>(
  commandName: string,
  subCommandName: string | false,
  workspaceDir: string,
  defaultOptions: C,
  options: C & GlobalCommandOptions,
  strategies: Partial<
    Record<keyof (C & GlobalCommandOptions), MergeStrategy>
  > = {},
): C & GlobalCommandOptions & CommandConfigurationFlatOpts {
  type R = C & GlobalCommandOptions & CommandConfigurationFlatOpts
  const resolvedDefaultOptions: R = resolveCommandConfigurationOptions<
    C & GlobalCommandOptions,
    C & GlobalCommandOptions
  >(
    logger,
    commandName,
    subCommandName,
    workspaceDir,
    { ...__defaultGlobalCommandOptions, ...defaultOptions },
    options,
    strategies,
  )

  // resolve encoding
  const encoding: string = cover<string>(
    resolvedDefaultOptions.encoding,
    options.encoding,
    isNonBlankString,
  )
  logger.debug('encoding:', encoding)

  return {
    ...resolvedDefaultOptions,
    encoding,
  }
}
