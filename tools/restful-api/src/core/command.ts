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
    .option('-e, --encoding <encoding>', 'specify encoding of all files.')
    .option('-p, --tsconfig-path <tsconfigPath>', 'path of tsconfig.json')

  return program
}
