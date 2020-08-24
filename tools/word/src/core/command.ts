import { version } from '@barusu/tool-word/package.json'
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
    .option('--encoding <encoding>', 'default encoding of files in the workspace')

  return program
}
