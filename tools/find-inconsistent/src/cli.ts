import program from 'commander'
import path from 'path'
import { Level } from '@barusu/chalk-logger'
import { name, version } from '@barusu/tool-find-inconsistent/package.json'
import {
  ConfigFlatOpts,
  findPackageJsonPath,
  flagDefaultOptions,
} from '@barusu/util-cli'
import { cover, coverString } from '@barusu/util-option'
import { PackageManager } from './index'
import {
  COMMAND_NAME,
  CommandOptions,
  defaultCommandOptions,
  logger,
} from './util'


program
  .storeOptionsAsProperties(false)
  .passCommandToAction(false)
  .version(version)

logger.registerToCommander(program)


program
  .name(COMMAND_NAME)
  .usage('<workspace> [options]')
  .arguments('<workspace>')
  .option('-c, --config-path <config filepath>', '', (val, acc: string[]) => acc.concat(val), [])
  .option('--parastic-config-path <parastic config filepath>', '')
  .option('--parastic-config-entry <parastic config filepath>', '')
  .action(function (workspace: string, options: CommandOptions) {
    const cwd: string = path.resolve()
    const workspaceDir: string = path.resolve(cwd, workspace)
    const configPath: string[] = options.configPath!.map((p: string) => path.resolve(workspaceDir, p))
    const parasticConfigPath: string | null | undefined = cover<string | null>(
      (): string | null => findPackageJsonPath(workspaceDir),
      options.parasticConfigPath)
    const parasticConfigEntry: string = coverString(name, options.parasticConfigEntry)
    const flatOpts: ConfigFlatOpts = {
      cwd,
      workspace: workspaceDir,
      configPath,
      parasticConfigPath,
      parasticConfigEntry,
    }

    const defaultOptions = flagDefaultOptions(
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
