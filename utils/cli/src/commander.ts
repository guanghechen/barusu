import commander from 'commander'
import { ColorfulChalkLogger } from '@barusu/chalk-logger'


export { commander }


/**
 * Create top command
 * @param commandName
 * @param version
 * @param logger
 */
export function createTopCommand(
  commandName: string,
  version: string,
  logger: ColorfulChalkLogger,
): commander.Command {
  const program = new commander.Command()

  program
    .storeOptionsAsProperties(false)
    .passCommandToAction(false)
    .version(version)
    .name(commandName)

  logger.registerToCommander(program)

  program
    .option('-c, --config-path <config filepath>', '', (val, acc: string[]) => acc.concat(val), [])
    .option('--parastic-config-path <parastic config filepath>', '')
    .option('--parastic-config-entry <parastic config filepath>', '')

  return program
}
