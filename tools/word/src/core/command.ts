import { Command, createTopCommand } from '@barusu/util-cli'
import { COMMAND_NAME, packageVersion } from '../util/env'


/**
 * Create a top commander instance with default global options
 */
export function createProgram(): Command {
  const program = createTopCommand(
    COMMAND_NAME,
    packageVersion,
  )

  // global options
  program
    .option('--encoding <encoding>', 'default encoding of files in the workspace')

  return program
}
