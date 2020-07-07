import program from 'commander'
import path from 'path'
import { Level } from '@barusu/chalk-logger'
import { name, version } from '@barusu/tool-tsconfig-paths/package.json'
import {
  ConfigFlatOpts,
  findPackageJsonPath,
  flagDefaultOptions,
} from '@barusu/util-cli'
import { cover, coverString } from '@barusu/util-option'
import { TsconfigPathAliasResolver } from './index'
import { COMMAND_NAME, defaultCommandOptions, logger } from './util'


program
  .storeOptionsAsProperties(false)
  .passCommandToAction(false)
  .version(version)


logger.registerToCommander(program)


program
  .name(COMMAND_NAME)
  .usage('[options]')
  .option('-c, --config-path <config filepath>', '', (val, acc: string[]) => acc.concat(val), [])
  .option('--parastic-config-path <parastic config filepath>', '')
  .option('--parastic-config-entry <parastic config filepath>', '')
  .option('-dts, <dtsRootPath>', 'root path of declarations')
  .requiredOption('-p, --project <tsconfigPath>', 'path of tsconfig.json', 'tsconfig.json')
  .action(function (options: any) {
    const cwd: string = path.resolve()
    const workspaceDir: string = path.resolve(cwd)
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

    const tsconfigPath = options.p || 'tsconfig.json'
    const dtsRootPath = options.dts
    logger.debug('tsconfigPath:', tsconfigPath)
    logger.debug('dtsRootPath:', dtsRootPath)

    const pathResolver = new TsconfigPathAliasResolver(cwd, tsconfigPath)
    pathResolver.processDts(dtsRootPath)
  })
  .parse(process.argv)
