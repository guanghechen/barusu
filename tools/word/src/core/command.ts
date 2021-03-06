import type { Command } from '@barusu/util-cli'
import { createTopCommand } from '@barusu/util-cli'
import { COMMAND_NAME, packageVersion } from '../env/constant'

/**
 * Create a top commander instance with default global options
 */
export function createProgram(): Command {
  const program = createTopCommand(COMMAND_NAME, packageVersion)

  // global options
  program.option(
    '--encoding <encoding>',
    'default encoding of files in the workspace',
  )

  return program
}
