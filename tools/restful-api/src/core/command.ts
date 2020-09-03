import { Command, createTopCommand } from '@barusu/util-cli'
import { COMMAND_NAME, packageVersion } from '../env/constant'


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
    .option('-e, --encoding <encoding>', 'specify encoding of all files.')
    .option('-p, --tsconfig-path <tsconfigPath>', 'path of tsconfig.json')

  return program
}
