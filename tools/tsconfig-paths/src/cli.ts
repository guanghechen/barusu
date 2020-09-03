import {
  CommandConfigurationFlatOpts,
  CommandConfigurationOptions,
  absoluteOfWorkspace,
  createTopCommand,
  resolveCommandConfigurationOptions,
} from '@barusu/util-cli'
import { cover, isNotEmptyString } from '@barusu/util-option'
import {
  COMMAND_NAME,
  TsconfigPathAliasResolver,
  logger,
  packageName,
  packageVersion,
} from './index'


const program = createTopCommand(
  COMMAND_NAME,
  packageVersion,
)


interface CommandOptions extends CommandConfigurationOptions {
  /**
   * path of tsconfig.json
   */
  readonly tsconfigPath: string
  /**
   * root path of declarations
   */
  readonly dts?: string
}


const defaultCommandOptions: CommandOptions = {
  dts: undefined,
  tsconfigPath: 'tsconfig.json',
}


program
  .usage('<workspace> [options]')
  .arguments('<workspace>')
  .requiredOption('-p, --project <tsconfigPath>', 'path of tsconfig.json', 'tsconfig.json')
  .option('--dts <dtsRootPath>', 'root path of declarations')
  .action(async function ([_workspaceDir], options: CommandOptions) {
    logger.setName(COMMAND_NAME)

    type R = CommandOptions & CommandConfigurationFlatOpts
    const defaultOptions: R = resolveCommandConfigurationOptions<
      CommandOptions, CommandOptions>(
        logger, packageName, false,
        defaultCommandOptions, _workspaceDir, options)

    // resolve tsconfig.json filepath
    const tsconfigPath: string = absoluteOfWorkspace(defaultOptions.workspace,
      cover<string>(defaultOptions.tsconfigPath, options.tsconfigPath, isNotEmptyString))
    logger.debug('tsconfigPath:', tsconfigPath)

    // resolve declaration root path
    const dts: string | undefined = absoluteOfWorkspace(defaultOptions.workspace,
      cover<string | undefined>(defaultOptions.dts, options.dts, isNotEmptyString))
    logger.debug('dts:', dts)

    const pathResolver = new TsconfigPathAliasResolver(defaultOptions.cwd, tsconfigPath)
    pathResolver.processDts(dts)
  })
  .parse(process.argv)
