import type {
  CommandConfigurationFlatOpts,
  CommandConfigurationOptions,
} from '@guanghechen/commander-helper'
import {
  createTopCommand,
  resolveCommandConfigurationOptions,
} from '@guanghechen/commander-helper'
import { locateNearestFilepath } from '@guanghechen/locate-helper'
import {
  COMMAND_NAME,
  PackageManager,
  logger,
  packageName,
  packageVersion,
} from '.'

const program = createTopCommand(COMMAND_NAME, packageVersion)

type CommandOptions = CommandConfigurationOptions

const defaultCommandOptions: CommandOptions = {}

program
  .usage('<workspace> [options]')
  .arguments('<workspace>')
  .action(function ([_workspaceDir], options: CommandOptions) {
    logger.setName(COMMAND_NAME)

    type R = CommandOptions & CommandConfigurationFlatOpts
    const defaultOptions: R = resolveCommandConfigurationOptions<
      CommandOptions,
      CommandOptions
    >(logger, packageName, false, _workspaceDir, defaultCommandOptions, options)

    const rootPackageJsonPath: string | null = locateNearestFilepath(
      defaultOptions.workspace,
      'package.json',
    )
    logger.debug('rootPackageJsonPath:', rootPackageJsonPath)

    if (rootPackageJsonPath == null) {
      logger.error(
        `Cannot find valid package.json on the workspace ${rootPackageJsonPath}`,
      )
      process.exit(-1)
    }

    const manager = new PackageManager()
    void manager.resolve(rootPackageJsonPath)
  })
  .parse(process.argv)
