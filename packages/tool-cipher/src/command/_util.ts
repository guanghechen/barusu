import fs from 'fs-extra'
import { name } from '@barusu/tool-cipher/package.json'
import { AESCipher } from '../util/aes-cipher'
import { WorkspaceCatalog } from '../util/catalog'
import { ERROR_CODE } from '../util/error'
import { logger } from '../util/logger'
import { CipherMaster } from '../util/master'


/**
 * create default options
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function createDefaultOptions(packageJsonPath: string) {
  const defaultOptions = {
    logLevel: undefined as unknown as string,
    secretFilepath: '.barusu-secret',
    indexFilepath: '.barusu-index',
    showAsterisk: true,
    plainFilepathPatterns: [],
    cipherFilepathPatterns: [],
  }
  return flatDefaultOptions(defaultOptions, packageJsonPath)
}


export function parseOption<T>(
  optionValue: T | null | undefined,
  defaultValue: T,
  isOptionValueValid?: (t: T | null | undefined) => any,
): T {
  const valid = isOptionValueValid != null
    ? isOptionValueValid(optionValue)
    : optionValue != null
  return valid ? optionValue! : defaultValue
}


/**
 * Flat defaultOptions with configs from package.json
 */
export function flatDefaultOptions(
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  defaultOptions: any,
  packageJsonPath: string,
): typeof defaultOptions {
  if (fs.existsSync(packageJsonPath)) {
    // read default options
    const packageJson = fs.readJSONSync(packageJsonPath)
    if (packageJson[name] != null) {
      return { ...defaultOptions, ...packageJson[name] }
    }
  }
  return defaultOptions
}


/**
 * handle error
 */
export function handleError(error: Error | any): void {
  const code = error.code || 0
  switch (code) {
    case ERROR_CODE.CANCELED:
      logger.error(error.message)
      process.exit(0)
      break
    case ERROR_CODE.BAD_PASSWORD:
    case ERROR_CODE.ENTERED_PASSWORD_DIFFER:
      logger.error(error.message)
      process.exit(-1)
      break
    default:
      logger.error('error:', error)
      process.exit(-1)
  }
}
