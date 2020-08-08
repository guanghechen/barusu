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
   * the directory where the encrypted files are saved
   * @default barusu-cipher
   */
  cipherRootDir: string
  /**
   * filename of index file of cipher directory
   * @default .barusu-index
   */
  cipherIndexFilename: string
  /**
   * url of source repository of plaintext files are located
   * @default null
   */
  plainRepositoryUrl: string
  /**
   * whether to print password asterisks
   * @default true
   */
  showAsterisk: boolean
  /**
   * the minimum size required of password
   * @default 6
   */
  miniumPasswordLength: number
}


/**
 * Default value of global options
 */
export const __defaultGlobalCommandOptions: GlobalCommandOptions = {
  secretFilepath: '.barusu-secret',
  cipherRootDir: 'barusu-cipher',
  cipherIndexFilename: '.barusu-index',
  plainRepositoryUrl: '',
  showAsterisk: true,
  miniumPasswordLength: 6,
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

  // resolve cipherRootDir
  const cipherRootDir: string = absoluteOfWorkspace(workspaceDir, cover<string>(
    resolvedDefaultOptions.cipherRootDir, options.cipherRootDir, isNotEmptyString))
  logger.debug('cipherRootDir:', cipherRootDir)

  // resolve indexFilepath
  const cipherIndexFilename: string = absoluteOfWorkspace(cipherRootDir, cover<string>(
    resolvedDefaultOptions.cipherIndexFilename, options.cipherIndexFilename, isNotEmptyString))
  logger.debug('cipherIndexFilename:', cipherIndexFilename)

  // resolve plainRepositoryUrl
  const _rawPlainRepositoryUrl: string | null = cover<string>(
    resolvedDefaultOptions.plainRepositoryUrl, options.plainRepositoryUrl, isNotEmptyString)
  logger.debug('_rawPlainRepositoryUrl:', _rawPlainRepositoryUrl)
  if (_rawPlainRepositoryUrl == null || _rawPlainRepositoryUrl.length <= 0) {
    throw new Error('bad plainRepositoryUrl')
  }
  const plainRepositoryUrl = (() => {
    // relative file path
    if (/[.\/]/.test(_rawPlainRepositoryUrl)) {
      return relativeOfWorkspace(
        cipherRootDir,
        absoluteOfWorkspace(workspaceDir, _rawPlainRepositoryUrl)
      )
    }
    return _rawPlainRepositoryUrl
  })()
  logger.debug('plainRepositoryUrl:', plainRepositoryUrl)

  // resolve showAsterisk
  const showAsterisk: boolean = cover<boolean>(
    resolvedDefaultOptions.showAsterisk, convertToBoolean(options.showAsterisk))
  logger.debug('showAsterisk:', showAsterisk)

  // resolve miniumPasswordLength
  const miniumPasswordLength: number = cover<number>(
    resolvedDefaultOptions.miniumPasswordLength, convertToNumber(options.miniumPasswordLength))
  logger.debug('miniumPasswordLength:', miniumPasswordLength)

  return {
    ...resolvedDefaultOptions,
    secretFilepath,
    cipherRootDir,
    cipherIndexFilename,
    plainRepositoryUrl,
    showAsterisk,
    miniumPasswordLength,
  }
}
