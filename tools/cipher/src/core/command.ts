import { version } from '@barusu/tool-restful-api/package.json'
import { Command, createTopCommand } from '@barusu/util-cli'
import { COMMAND_NAME, logger } from '../util/logger'


/**
 * Create a top commander instance with default global options
 */
export function createProgram(): Command {
  const program = createTopCommand(
    COMMAND_NAME,
    version,
    logger
  )

  // global options
  program
    .option('--secret-filepath <secret filepath>', 'path of secret file')
    .option('--index-filepath <cipher files index>', 'path of index of cipher files')
    .option('--cipher-root-dir <cipherRootDir>', 'root dir of cipher files')
    .option('--show-asterisk', 'whether to print password asterisks')
    .option('--minimum-password-length', 'the minimum size required of password')

  return program
}
