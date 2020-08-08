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
    .option('--secret-filepath <secretFilepath>', 'path of secret file')
    .option('--cipher-root-dir <cipherRootDir>', 'the directory where the encrypted files are saved')
    .option('--cipher-index-filename <cipherIndexFilename>', 'filename of index file of cipher directory')
    .option('--plain-repository-url', 'url of source repository of plaintext files are located')
    .option('--show-asterisk', 'whether to print password asterisks')
    .option('--minimum-password-length', 'the minimum size required of password')

  return program
}
