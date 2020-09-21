import {
  CommandConfigurationFlatOpts,
  CommandConfigurationOptions,
  createTopCommand,
  findPackageJsonPath,
  resolveCommandConfigurationOptions,
} from '@barusu/util-cli'
import {
  COMMAND_NAME,
  PackageManager,
  logger,
  packageName,
  packageVersion,
} from './index'


const program = createTopCommand(
  COMMAND_NAME,
  packageVersion,
)



interface CommandOptions extends CommandConfigurationOptions {

}


const defaultCommandOptions: CommandOptions = {
}



program
  .usage('<workspace> [options]')
  .arguments('<workspace>')
  .action(function ([_workspaceDir], options: CommandOptions) {
    logger.setName(COMMAND_NAME)

    type R = CommandOptions & CommandConfigurationFlatOpts
    const defaultOptions: R = resolveCommandConfigurationOptions<
      CommandOptions, CommandOptions>(
        logger, packageName, false,
        defaultCommandOptions, _workspaceDir, options)

    const rootPackageJsonPath: string | null = findPackageJsonPath(defaultOptions.workspace)
    logger.debug('rootPackageJsonPath:', rootPackageJsonPath)

    if (rootPackageJsonPath == null) {
      logger.error(`Cannot find valid package.json on the workspace ${ rootPackageJsonPath }`)
      process.exit(-1)
    }

    const manager = new PackageManager()
    manager.resolve(rootPackageJsonPath)
  })
  .parse(process.argv)
