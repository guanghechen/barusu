import {
  CommandConfigurationFlatOpts,
  CommandConfigurationOptions,
  absoluteOfWorkspace,
  relativeOfWorkspace,
  resolveCommandConfigurationOptions,
} from '@barusu/util-cli'
import {
  MergeStrategy,
  convertToBoolean,
  convertToNumber,
  cover,
  isNotEmptyString,
} from '@barusu/util-option'
import { logger } from '../util/logger'


/**
 * Global command options
 */
export interface GlobalCommandOptions extends CommandConfigurationOptions {
  /**
   * path of secret file
   * @default .barusu-secret
   */
  secretFilepath: string
  /**
   * encoding of secret file
   * @default 'utf-8'
   */
  secretFileEncoding: string
  /**
   * path of index file of ciphertext files
   * @default .barusu-index
   */
  indexFilepath: string
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
   * url of source repository of plaintext files are located
   * @default null
   */
  plaintextRepositoryUrl: string
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
  secretFilepath: '.barusu-secret',
  secretFileEncoding: 'utf-8',
  indexFilepath: '.barusu-index',
  ciphertextRootDir: 'barusu-ciphertext',
  plaintextRootDir: 'barusu-plaintext',
  plaintextRepositoryUrl: '',
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
  strategies: Partial<Record<keyof (C & GlobalCommandOptions), MergeStrategy>> = {},
): C & GlobalCommandOptions & CommandConfigurationFlatOpts {
  type R = C & GlobalCommandOptions & CommandConfigurationFlatOpts
  const resolvedDefaultOptions: R = resolveCommandConfigurationOptions<
    C & GlobalCommandOptions, C & GlobalCommandOptions>(
      logger,
      commandName,
      subCommandName,
      { ...__defaultGlobalCommandOptions, ...defaultOptions },
      workspaceDir,
      options,
      strategies
    )

  // resolve secretFilepath
  const secretFilepath: string = absoluteOfWorkspace(workspaceDir, cover<string>(
    resolvedDefaultOptions.secretFilepath, options.secretFilepath, isNotEmptyString))
  logger.debug('secretFilepath:', secretFilepath)

  // resolve secretFileEncoding
  const secretFileEncoding: string = cover<string>(
    resolvedDefaultOptions.secretFileEncoding, options.secretFileEncoding, isNotEmptyString)
  logger.debug('secretFileEncoding:', secretFileEncoding)

  // resolve indexFilepath
  const indexFilepath: string = absoluteOfWorkspace(workspaceDir, cover<string>(
    resolvedDefaultOptions.indexFilepath, options.indexFilepath, isNotEmptyString))
  logger.debug('indexFilepath:', indexFilepath)

  // resolve ciphertextRootDir
  const ciphertextRootDir: string = absoluteOfWorkspace(workspaceDir, cover<string>(
    resolvedDefaultOptions.ciphertextRootDir, options.ciphertextRootDir, isNotEmptyString))
  logger.debug('ciphertextRootDir:', ciphertextRootDir)

  // resolve plaintextRootDir
  const plaintextRootDir: string = absoluteOfWorkspace(workspaceDir, cover<string>(
    resolvedDefaultOptions.plaintextRootDir, options.plaintextRootDir, isNotEmptyString))
  logger.debug('plaintextRootDir:', plaintextRootDir)

  // resolve plaintextRepositoryUrl
  const plaintextRepositoryUrl = (() => {
    const rawPlaintextRepositoryUrl: string | null = cover<string>(
      resolvedDefaultOptions.plaintextRepositoryUrl, options.plaintextRepositoryUrl, isNotEmptyString)
    logger.debug('rawPlaintextRepositoryUrl:', rawPlaintextRepositoryUrl)

    // bad plaintextRepositoryUrl
    if (rawPlaintextRepositoryUrl == null || rawPlaintextRepositoryUrl.length <= 0) {
      return ''
    }

    // relative file path
    if (/[.\/]/.test(rawPlaintextRepositoryUrl)) {
      return relativeOfWorkspace(
        ciphertextRootDir,
        absoluteOfWorkspace(workspaceDir, rawPlaintextRepositoryUrl)
      )
    }
    return rawPlaintextRepositoryUrl
  })()
  logger.debug('plaintextRepositoryUrl:', plaintextRepositoryUrl)

  // resolve showAsterisk
  const showAsterisk: boolean = cover<boolean>(
    resolvedDefaultOptions.showAsterisk, convertToBoolean(options.showAsterisk))
  logger.debug('showAsterisk:', showAsterisk)

  // resolve minPasswordLength
  const minPasswordLength: number = cover<number>(
    resolvedDefaultOptions.minPasswordLength, convertToNumber(options.minPasswordLength))
  logger.debug('minPasswordLength:', minPasswordLength)

  // resolve maxPasswordLength
  const maxPasswordLength: number = cover<number>(
    resolvedDefaultOptions.maxPasswordLength, convertToNumber(options.maxPasswordLength))
  logger.debug('maxPasswordLength:', maxPasswordLength)

  return {
    ...resolvedDefaultOptions,
    secretFilepath,
    secretFileEncoding,
    indexFilepath,
    ciphertextRootDir,
    plaintextRootDir,
    plaintextRepositoryUrl,
    showAsterisk,
    minPasswordLength,
    maxPasswordLength,
  }
}
