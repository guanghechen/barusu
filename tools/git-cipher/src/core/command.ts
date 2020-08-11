import { version } from '@barusu/tool-restful-api/package.json'
import { Command, createTopCommand } from '@barusu/util-cli'
import { COMMAND_NAME } from '../util/env'
import { logger } from '../util/logger'


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
    .option('--secret-file-encoding <secretFileEncoding>', 'encoding of secret file')
    .option('--index-filepath <indexFilepath>', 'path of index file of ciphertext files')
    .option('--ciphertext-root-dir <ciphertextRootDir>', 'the directory where the encrypted files are stored')
    .option('--plaintext-root-dir <plaintextRootDir>', 'the directory where the source plaintext files are stored')
    .option('--plaintext-repository-url <plaintextRepositoryUrl>', 'url of source repository of plaintext files are located')
    .option('--show-asterisk', 'whether to print password asterisks')
    .option('--minimum-password-length', 'the minimum size required of password')

  return program
}
