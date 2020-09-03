import path from 'path'
import { Level } from '@barusu/chalk-logger'
import {
  CommandConfigurationFlatOpts,
  absoluteOfWorkspace,
  createTopCommand,
  findPackageJsonPath,
  flatOptionsFromConfiguration,
} from '@barusu/util-cli'
import { cover, coverString } from '@barusu/util-option'
import {
  COMMAND_NAME,
  CommandOptions,
  PackageManager,
  defaultCommandOptions,
  logger,
  packageName,
  packageVersion,
} from './index'


const program = createTopCommand(
  COMMAND_NAME,
  packageVersion,
)

program
  .usage('<workspace> [options]')
  .arguments('<workspace>')
  .action(function ([workspace], options: CommandOptions) {
    const cwd: string = path.resolve()
    const workspaceDir: string = path.resolve(cwd, workspace)
    const configPath: string[] = options.configPath!.map((p: string) => absoluteOfWorkspace(workspaceDir, p))
    const parasticConfigPath: string | null | undefined = cover<string | null>(
      (): string | null => findPackageJsonPath(workspaceDir),
      options.parasticConfigPath)
    const parasticConfigEntry: string = coverString(packageName, options.parasticConfigEntry)
    const flatOpts: CommandConfigurationFlatOpts = {
      cwd,
      workspace: workspaceDir,
      configPath,
      parasticConfigPath,
      parasticConfigEntry,
    }

    const defaultOptions = flatOptionsFromConfiguration(
      defaultCommandOptions,
      flatOpts,
      false,
      {},
    )

    // reset log-level
    const logLevel = cover<string | undefined>(defaultOptions.logLevel, options.logLevel)
    if (logLevel != null) {
      const level = Level.valueOf(logLevel)
      if (level != null) logger.setLevel(level)
    }

    logger.debug('cwd:', flatOpts.cwd)
    logger.debug('workspace:', flatOpts.workspace)
    logger.debug('configPath:', flatOpts.configPath)
    logger.debug('parasticConfigPath:', flatOpts.parasticConfigPath)
    logger.debug('parasticConfigEntry:', flatOpts.parasticConfigEntry)

    const rootPackageJsonPath: string | null = findPackageJsonPath(workspaceDir)
    logger.debug('rootPackageJsonPath:', rootPackageJsonPath)

    if (rootPackageJsonPath == null) {
      logger.error(`Cannot find valid package.json on the workspace ${ rootPackageJsonPath }`)
      process.exit(-1)
    }

    const manager = new PackageManager
    manager.resolve(rootPackageJsonPath)
  })
  .parse(process.argv)
