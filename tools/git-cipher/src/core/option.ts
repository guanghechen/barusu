import type {
  CommandConfigurationFlatOpts,
  CommandConfigurationOptions,
  MergeStrategy,
} from '@barusu/util-cli'
import {
  absoluteOfWorkspace,
  resolveCommandConfigurationOptions,
} from '@barusu/util-cli'
import {
  convertToBoolean,
  convertToNumber,
  cover,
  isNonBlankString,
} from '@guanghechen/option-helper'
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
  /**
   * path of secret file
   * @default .barusu-secret
   */
  secretFilepath: string
  /**
   * encoding of secret file
   * @default utf-8
   */
  secretFileEncoding: string
  /**
   * path of index file of ciphertext files
   * @default .barusu-index
   */
  indexFilepath: string
  /**
   * encoding of index file
   * @default utf-8
   */
  indexFileEncoding: string
  /**
   * the directory where the encrypted files are stored
   * @default barusu-ciphertext
   */
  ciphertextRootDir: string
  /**
   * the directory where the source plaintext files are stored
   * @default barusu-plaintext
   */
  plaintextRootDir: string
  /**
   * whether to print password asterisks
   * @default true
   */
  showAsterisk: boolean
  /**
   * the minimum size required of password
   * @default 6
   */
  minPasswordLength: number
  /**
   * the maximum size required of password
   * @default 100
   */
  maxPasswordLength: number
}

/**
 * Default value of global options
 */
export const __defaultGlobalCommandOptions: GlobalCommandOptions = {
  encoding: 'utf-8',
  secretFilepath: '.barusu-secret',
  secretFileEncoding: 'utf-8',
  indexFilepath: '.barusu-index',
  indexFileEncoding: 'utf-8',
  ciphertextRootDir: 'barusu-ciphertext',
  plaintextRootDir: 'barusu-plaintext',
  showAsterisk: true,
  minPasswordLength: 6,
  maxPasswordLength: 100,
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

  // resolve encoding
  const encoding: string = cover<string>(
    resolvedDefaultOptions.encoding,
    options.encoding,
    isNonBlankString,
  )
  logger.debug('encoding:', encoding)

  // resolve secretFilepath
  const secretFilepath: string = absoluteOfWorkspace(
    workspaceDir,
    cover<string>(
      resolvedDefaultOptions.secretFilepath,
      options.secretFilepath,
      isNonBlankString,
    ) as string,
  )
  logger.debug('secretFilepath:', secretFilepath)

  // resolve secretFileEncoding
  const secretFileEncoding: string = cover<string>(
    resolvedDefaultOptions.secretFileEncoding,
    options.secretFileEncoding,
    isNonBlankString,
  )
  logger.debug('secretFileEncoding:', secretFileEncoding)

  // resolve indexFilepath
  const indexFilepath: string = absoluteOfWorkspace(
    workspaceDir,
    cover<string>(
      resolvedDefaultOptions.indexFilepath,
      options.indexFilepath,
      isNonBlankString,
    ) as string,
  )
  logger.debug('indexFilepath:', indexFilepath)

  // resolve indexFileEncoding
  const indexFileEncoding: string = cover<string>(
    resolvedDefaultOptions.indexFileEncoding,
    options.indexFileEncoding,
    isNonBlankString,
  )
  logger.debug('indexFileEncoding:', indexFileEncoding)

  // resolve ciphertextRootDir
  const ciphertextRootDir: string = absoluteOfWorkspace(
    workspaceDir,
    cover<string>(
      resolvedDefaultOptions.ciphertextRootDir,
      options.ciphertextRootDir,
      isNonBlankString,
    ) as string,
  )
  logger.debug('ciphertextRootDir:', ciphertextRootDir)

  // resolve plaintextRootDir
  const plaintextRootDir: string = absoluteOfWorkspace(
    workspaceDir,
    cover<string>(
      resolvedDefaultOptions.plaintextRootDir,
      options.plaintextRootDir,
      isNonBlankString,
    ) as string,
  )
  logger.debug('plaintextRootDir:', plaintextRootDir)

  // resolve showAsterisk
  const showAsterisk: boolean = cover<boolean>(
    resolvedDefaultOptions.showAsterisk,
    convertToBoolean(options.showAsterisk),
  )
  logger.debug('showAsterisk:', showAsterisk)

  // resolve minPasswordLength
  const minPasswordLength: number = cover<number>(
    resolvedDefaultOptions.minPasswordLength,
    convertToNumber(options.minPasswordLength),
  )
  logger.debug('minPasswordLength:', minPasswordLength)

  // resolve maxPasswordLength
  const maxPasswordLength: number = cover<number>(
    resolvedDefaultOptions.maxPasswordLength,
    convertToNumber(options.maxPasswordLength),
  )
  logger.debug('maxPasswordLength:', maxPasswordLength)

  return {
    ...resolvedDefaultOptions,
    encoding,
    secretFilepath,
    secretFileEncoding,
    indexFilepath,
    indexFileEncoding,
    ciphertextRootDir,
    plaintextRootDir,
    showAsterisk,
    minPasswordLength,
    maxPasswordLength,
  }
}
