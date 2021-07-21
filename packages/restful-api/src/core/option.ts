import { resolveCommandConfigurationOptions } from '@guanghechen/commander-helper'
import type {
  CommandConfigurationFlatOpts,
  CommandConfigurationOptions,
  MergeStrategy,
} from '@guanghechen/commander-helper'
import { absoluteOfWorkspace } from '@guanghechen/file-helper'
import { cover, isNonBlankString } from '@guanghechen/option-helper'
import { logger } from '../env/logger'

/**
 * Global command options
 */
export interface GlobalCommandOptions extends CommandConfigurationOptions {
  /**
   * The encoding format of files in the working directory
   * @default 'utf-8'
   */
  encoding: string
  /**
   * Path of tsconfig.json
   * @default tsconfig.json
   */
  tsconfigPath: string
}

/**
 * Default value of global options
 */
export const __defaultGlobalCommandOptions: GlobalCommandOptions = {
  encoding: 'utf-8',
  tsconfigPath: 'tsconfig.json',
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

  // resolve tsconfig.json filepath
  const tsconfigPath: string = absoluteOfWorkspace(
    resolvedDefaultOptions.workspace,
    cover<string>(
      resolvedDefaultOptions.tsconfigPath,
      options.tsconfigPath,
      isNonBlankString,
    ),
  )
  logger.debug('tsconfigPath:', tsconfigPath)

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
    tsconfigPath,
  }
}
