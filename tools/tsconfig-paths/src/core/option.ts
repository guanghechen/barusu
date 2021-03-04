import type {
  CommandConfigurationFlatOpts,
  CommandConfigurationOptions,
  MergeStrategy,
} from '@barusu/util-cli'
import { resolveCommandConfigurationOptions } from '@barusu/util-cli'
import { logger } from '../env/logger'

/**
 * Global command options
 */
export type GlobalCommandOptions = CommandConfigurationOptions

/**
 * Default value of global options
 */
export const __defaultGlobalCommandOptions: GlobalCommandOptions = {}

/**
 *
 * @param flatOpts
 * @param subCommandName
 * @param strategies
 */
export function resolveGlobalCommandOptions<C extends Record<string, unknown>>(
  commandName: string,
  subCommandName: string | false,
  defaultOptions: C,
  workspaceDir: string,
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
    { ...__defaultGlobalCommandOptions, ...defaultOptions },
    workspaceDir,
    options,
    strategies,
  )

  return {
    ...resolvedDefaultOptions,
  }
}
