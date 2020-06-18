import program from 'commander'
import fs from 'fs-extra'
import path from 'path'
import { Level } from '@barusu/chalk-logger'
import { convertToBoolean, isNotEmptyString } from '@barusu/option-util'
import { name, version } from '@barusu/tool-cipher/package.json'
import { logger } from './index'
import { ERROR_CODE } from './util/error'
import { CipherMaster } from './util/master'


program
  .version(version)
  .name('barusu-cipher')

logger.registerToCommander(program)


// Sub-command: init
program
  .command('init <directory>')
  .option('-S, --secret-filepath <secret filepath>', 'path of secret file')
  .option('--show-asterisk', 'whether to print password asterisks')
  .action(async function (workspace: string, options: any) {
    const cwd: string = workspace || path.resolve()
    const packageJsonPath = path.resolve(cwd, 'package.json')
    const defaultOptions = flatDefaultOptions({
      logLevel: undefined as any,
      secretFilepath: 'barusu.secret.txt',
      showAsterisk: true,
    }, packageJsonPath)

    // reset log-level
    const logLevel = parseOption<string>(options.logLevel, defaultOptions.logLevel)
    if (logLevel != null) {
      const level = Level.valueOf(logLevel)
      if (level != null) logger.setLevel(level)
    }

    // get secretFilepath
    const secretFilepath: string = path.resolve(cwd, parseOption<string>(
      options.secretFilepath, defaultOptions.secretFilepath, isNotEmptyString))

    // get showAsterisk
    const showAsterisk: boolean = parseOption<boolean>(
      convertToBoolean(options.showAsterisk), defaultOptions.showAsterisk)

    logger.debug('packageJsonPath:', packageJsonPath)
    logger.debug('secretFilepath:', secretFilepath)
    logger.debug('showAsterisk:', showAsterisk)

    try {
      const master = new CipherMaster({ showAsterisk })
      await master.createSecret(secretFilepath)
    } catch (error) {
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
  })


program
  .parse(process.argv)


function parseOption<T>(
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
function flatDefaultOptions(
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
