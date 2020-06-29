import commander from 'commander'
import {
  CoverOperationFunc,
  OptionMaster,
  TDSchema,
  coverBoolean,
  coverNumber,
  coverString,
} from 'option-master'
import path from 'path'
import { SubCommand } from './types/commander'
import { AppContextConfig, GlobalContextConfig } from './types/context'
import { CmdOptions, GlobalCmdOptions } from './types/option'
import { loadConfigSchema, loadContextConfig } from './util/context-util'
import { logger, updateLogLevel } from './util/logger'


/**
 *
 */
export class Commander {
  private readonly program: commander.Command
  private readonly optionMaster: OptionMaster
  private readonly schema: TDSchema
  private readonly globalOptions: GlobalCmdOptions
  private readonly version: string
  private archived: boolean

  public constructor(
    version: string,
    program: commander.Command,
    optionMaster: OptionMaster,
  ) {
    this.version = version
    this.program = program
    this.optionMaster = optionMaster
    this.schema = loadConfigSchema(optionMaster, 'app')
    this.archived = false
    this.globalOptions = this.defaultOptions

    const globalOptions = this.globalOptions
    const coverGlobalOption = (key: keyof GlobalCmdOptions) => (value: any) => {
      globalOptions[key] = { value, userSpecified: true }
    }

    // init program
    program
      .version(version)
      .option('-c, --config-path <config-path>', 'specify the file path of main config (absolute or relative to the cwd)', 'app.yml')
      .option('-f, --api-config-path <api-config-path>', 'specify the file/directory path of api-item config file (absolute or relative to the cwd)', 'api.yml')
      .option('-s, --schema-root-path <schema-root-path>', 'specify the root path of schema (absolute or relative to the cwd)', 'schemas')
      .option('--encoding <encoding>', 'specify encoding of all files.', 'utf-8')
      .option('--log-level <level>', 'specify logger\'s level.')
      .on('option:encoding', coverGlobalOption('encoding'))
      .on('option:config-path', coverGlobalOption('configPath'))
      .on('option:api-config-path', coverGlobalOption('apiConfigPath'))
      .on('option:schema-root-path', coverGlobalOption('schemaRootPath'))
      .on('option:log-level', (t: string) => {
        coverGlobalOption('logLevel')(t)
        updateLogLevel(t)
      })

    // debug logger
    logger.debug('[globalOptions] cwd:', globalOptions.cwd)
    logger.debug('[globalOptions] version:', globalOptions.version)
    logger.debug('[globalOptions] configPath:', globalOptions.configPath)
    logger.debug('[globalOptions] apiConfigPath:', globalOptions.apiConfigPath)
    logger.debug('[globalOptions] schemaRootPath:', globalOptions.schemaRootPath)
    logger.debug('[globalOptions] encoding:', globalOptions.encoding)
    logger.debug('[globalOptions] logLevel:', globalOptions.logLevel)
  }

  /**
   * register sub command
   * @param name          the name of sub-command
   * @param loadCommand   function to load sub-command
   */
  public registerCommand<T extends keyof AppContextConfig>(subCommand?: SubCommand<T, any>): this {
    // if subCommand is null/undefined, skipped.
    if (subCommand == null) return this

    if (this.archived) {
      throw new Error(`[registerCommand] Commander has been archived. name(${ subCommand.name })`)
    }

    const self = this
    const { program, globalOptions } = self

    // calculate global context configuration
    const calcGlobalContextConfig = (projectDir: string): GlobalContextConfig => {
      // eslint-disable-next-line no-param-reassign
      projectDir = path.resolve(globalOptions.cwd.value, projectDir)
      const globalContextConfig: GlobalContextConfig = self.loadConfig(
        'globalOptions', projectDir, globalOptions, ['configPath', 'version'])

      // debug logger
      globalContextConfig.version = self.version
      globalContextConfig.apiConfigPath = path.resolve(projectDir, globalContextConfig.apiConfigPath)
      globalContextConfig.schemaRootPath = path.resolve(projectDir, globalContextConfig.schemaRootPath)
      logger.debug('[globalContextConfig] cwd:', globalContextConfig.cwd)
      logger.debug('[globalContextConfig] version:', globalContextConfig.version)
      logger.debug('[globalContextConfig] projectDir:', projectDir)
      logger.debug('[globalContextConfig] apiConfigPath:', globalContextConfig.apiConfigPath)
      logger.debug('[globalContextConfig] schemaRootPath:', globalContextConfig.schemaRootPath)
      logger.debug('[globalContextConfig] encoding:', globalContextConfig.encoding)
      logger.debug('[globalContextConfig] logLevel:', globalContextConfig.logLevel)
      return globalContextConfig
    }

    // calculate sub-command context configuration
    const calcContextConfig = (projectDir: string, cmdOptions: CmdOptions, ignoredKeys: (keyof CmdOptions)[] = []) => {
      // eslint-disable-next-line no-param-reassign
      projectDir = path.resolve(globalOptions.cwd.value, projectDir)
      ignoredKeys.push('configPath', 'cwd', 'logLevel', 'version')
      return this.loadConfig(subCommand.name, projectDir, cmdOptions, ignoredKeys)
    }

    // mount sub-command
    subCommand.mount(
      program,
      globalOptions,
      calcGlobalContextConfig,
      calcContextConfig,
    )
    return this
  }

  /**
   * parse cli-parameters and stop registration sub-command to generate cli program
   * @param args
   */
  public run(args: string[]): void {
    if (this.archived) return
    this.archived = true
    this.program.parse(args)
  }

  /**
   * default global options
   * @readonly
   * @type {GlobalCmdOptions}
   * @memberof Commander
   */
  public get defaultOptions(): GlobalCmdOptions {
    const self = this
    const defaultOptions: GlobalCmdOptions = {
      cwd: {
        value: process.cwd(),
        userSpecified: true,
      },
      version: {
        value: self.version,
        userSpecified: false,
      },
      configPath: {
        value: 'app.yml',
        userSpecified: false,
      },
      apiConfigPath: {
        value: 'api.yml',
        userSpecified: false,
      },
      schemaRootPath: {
        value: 'schemas',
        userSpecified: false,
      },
      encoding: {
        value: 'utf-8',
        userSpecified: false,
      },
      logLevel: {
        value: 'info',
        userSpecified: false,
      },
    }
    return defaultOptions
  }

  /**
   * load context config of AppContextConfig
   * @param name          the name of sub-command
   * @param projectDir
   * @param cmdOptions    cli-parameters of sub-command
   */
  private loadConfig<T extends keyof AppContextConfig>(
    name: T,
    projectDir: string,
    cmdOptions: CmdOptions,
    ignoredKeys: (keyof CmdOptions)[],
  ): Exclude<AppContextConfig[T], undefined> {
    const { optionMaster, schema, globalOptions } = this
    const appContextConfigPath: string = path.resolve(projectDir, globalOptions.configPath.value)

    // load appContextConfig
    const appContextConfig: AppContextConfig = loadContextConfig({
      optionMaster,
      schema,
      configPath: appContextConfigPath,
      encoding: globalOptions.encoding.value,
      fallbackData: {},
      preprocess: (json: AppContextConfig) => {
        const contextConfig: Exclude<AppContextConfig[T], undefined> = { ...json[name] } as any
        const cover = <T>(coverFunc: CoverOperationFunc<T>, defaultValue: T | undefined, value: any): T => {
          const result = coverFunc(defaultValue, value)
          if (result.hasError) {
            throw result.errorSummary
          }
          return result.value!
        }

        // override parameters in configuration files with cli-parameters
        for (const key of Object.getOwnPropertyNames(cmdOptions)) {
          if (ignoredKeys.includes(key)) continue
          const optionValue = cmdOptions[key].value
          const configValue = contextConfig[key]
          let coverFunc = cmdOptions[key].coverFunc
          if (coverFunc == null) {
            switch (typeof optionValue) {
              case 'boolean':
                coverFunc = coverBoolean
                break
              case 'string':
                coverFunc = coverString
                break
              case 'number':
                coverFunc = coverNumber
                break
              default:
                logger.error(`unexpected value type: ${ typeof optionValue }. key(${ key }), optionValue(${ optionValue })`)
            }
          }
          contextConfig[key] = cmdOptions[key].userSpecified
            ? cmdOptions[key].value
            : cover<any>(coverFunc!, optionValue, configValue)
        }
        return { [name]: contextConfig }
      }
    })
    return appContextConfig[name] as Exclude<AppContextConfig[T], undefined>
  }
}
