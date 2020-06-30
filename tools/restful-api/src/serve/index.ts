import commander from 'commander'
import { CoverOperationFunc, coverInteger, coverString } from 'option-master'
import path from 'path'
import { SubCommand, SubCommandHook } from '../core/types/commander'
import { GlobalContextConfig, ServeContextConfig } from '../core/types/context'
import {
  CmdOptions,
  GlobalCmdOptions,
  ServeCmdOptions,
} from '../core/types/option'
import { logger } from '../core/util/logger'
import { RestfulApiToolServerContext } from './context'
import { RestfulApiToolServer } from './server'
export * from './context'
export * from './server'


export type ServeCommandAfterTriggeredHook = (
  projectDir: string, options: ServeCmdOptions
) => Promise<void> | void


export type ServeCommandBeforeStartHook = (
  server: RestfulApiToolServer,
  context: RestfulApiToolServerContext,
) => Promise<void> | void

export type ServeCommandAfterCompletedHook = (
  server: RestfulApiToolServer,
  context: RestfulApiToolServerContext,
) => Promise<void> | void

export type ServeCommandHook =
  | ServeCommandAfterTriggeredHook
  | ServeCommandBeforeStartHook
  | ServeCommandAfterCompletedHook


/**
 * sub-command `serve`
 */
export class ServeCommand implements SubCommand<'serve', ServeCmdOptions> {
  public readonly name = 'serve'
  protected readonly afterTriggeredHooks: ServeCommandAfterTriggeredHook[] = []
  protected readonly beforeStartHooks: ServeCommandBeforeStartHook[] = []
  protected readonly afterCompletedHooks: ServeCommandAfterCompletedHook[] = []

  public mount(
    program: commander.Command,
    globalCmdOptions: GlobalCmdOptions,
    calcGlobalContextConfig: (projectDir: string) => GlobalContextConfig,
    calcContextConfig: (
      projectDir: string,
      cmdOptions: CmdOptions,
      ignoredKeys?: (keyof CmdOptions)[],
    ) => ServeContextConfig,
  ): void {
    const self = this
    const serveOptions = self.defaultOptions
    const coverServeOption = (key: keyof ServeCmdOptions, value: any) => {
      if (value == null) return
      serveOptions[key] = { value, userSpecified: true } as any
    }

    // init sub-command serve
    program
      .command('serve <project-dir>')
      .alias('s')
      .option('-h, --host <host>', 'specify the ip/domain address to which the mock-server listens.')
      .option('-p, --port <port>', 'specify the port on which the mock-server listens.')
      .option('--prefix-url <prefixUrl>', 'specify the prefix url of routes.')
      .option('--mock-required-only', 'json-schema-faker\'s option `requiredOnly`')
      .option('--mock-optionals-always', 'json-schema-faker\'s option `alwaysFakeOptionals`')
      .option('--mock-optionals-probability <optionalsProbability>', 'json-schema-faker\'s option `optionalsProbability`')
      .option('--mock-use-data-file-first <mockDataFileRootPath>', 'specify the mock data file root path.')
      .option('--mock-data-file-first', 'preferred use data file as mock data source.')
      .action(async function (projectDir: string, options: ServeCmdOptions) {
        logger.setName(self.name)

        // execute hook after action triggered
        for (const hook of self.afterTriggeredHooks) {
          await hook(projectDir, options)
        }

        coverServeOption('host', options.host)
        coverServeOption('port', options.port)
        coverServeOption('mockDataFileRootPath', options.mockDataFileRootPath)
        coverServeOption('mockDataFileFirst', options.mockDataFileFirst)
        coverServeOption('mockRequiredOnly', options.mockRequiredOnly)
        coverServeOption('mockOptionalsAlways', options.mockOptionalsAlways)
        coverServeOption('mockOptionsProbability', options.mockOptionsProbability)

        // debug logger
        logger.debug('projectDir:', projectDir)
        logger.debug('[serveOptions] host:', serveOptions.host)
        logger.debug('[serveOptions] port:', serveOptions.port)
        logger.debug('[serveOptions] mockRequiredOnly:', serveOptions.mockRequiredOnly)
        logger.debug('[serveOptions] mockOptionalsAlways:', serveOptions.mockOptionalsAlways)
        logger.debug('[serveOptions] mockOptionalsProbability:', serveOptions.mockOptionalsProbability)
        logger.debug('[serveOptions] mockDataFileFirst:', serveOptions.mockDataFileFirst)
        logger.debug('[serveOptions] mockDataFileRootPath:', serveOptions.mockDataFileRootPath)

        // eslint-disable-next-line no-param-reassign
        projectDir = path.resolve(globalCmdOptions.cwd.value, projectDir || '')
        const globalContextConfig = calcGlobalContextConfig(projectDir)
        const contextConfig: ServeContextConfig = calcContextConfig(projectDir, {
          ...globalCmdOptions,
          ...serveOptions
        })

        // debug logger
        logger.debug('projectDir:', projectDir)
        logger.debug('[serveContextConfig] host:', contextConfig.host)
        logger.debug('[serveContextConfig] port:', contextConfig.port)
        logger.debug('[serveContextConfig] prefixUrl:', contextConfig.prefixUrl)
        logger.debug('[serveContextConfig] encoding:', contextConfig.encoding)
        logger.debug('[serveContextConfig] apiConfigPath:', contextConfig.apiConfigPath)
        logger.debug('[serveContextConfig] schemaRootPath:', contextConfig.schemaRootPath)
        logger.debug('[serveContextConfig] mockRequiredOnly:', contextConfig.mockRequiredOnly)
        logger.debug('[serveContextConfig] mockOptionalsAlways:', contextConfig.mockOptionalsAlways)
        logger.debug('[serveContextConfig] mockOptionalsProbability:', contextConfig.mockOptionalsProbability)
        logger.debug('[serveContextConfig] mockDataFileFirst:', contextConfig.mockDataFileFirst)
        logger.debug('[serveContextConfig] mockDataFileRootPath:', contextConfig.mockDataFileRootPath)

        const context = new RestfulApiToolServerContext(projectDir, globalContextConfig, contextConfig)
        const server = new RestfulApiToolServer(context)

        // execute hook before executing command
        for (const hook of self.beforeStartHooks) {
          await hook(server, context)
        }

        await server.start()

        // execute hook after command completed
        for (const hook of self.afterCompletedHooks) {
          await hook(server, context)
        }
      })
  }

  public onHook(type: SubCommandHook.AFTER_TRIGGERED, hook: ServeCommandAfterTriggeredHook): this
  public onHook(type: SubCommandHook.BEFORE_START, hook: ServeCommandBeforeStartHook): this
  public onHook(type: SubCommandHook.AFTER_COMPLETED, hook: ServeCommandAfterCompletedHook): this
  public onHook(type: SubCommandHook, hook: ServeCommandHook): this {
    switch (type) {
      case SubCommandHook.AFTER_TRIGGERED:
        this.afterTriggeredHooks.push(hook as ServeCommandAfterTriggeredHook)
        break
      case SubCommandHook.BEFORE_START:
        this.beforeStartHooks.push(hook as ServeCommandBeforeStartHook)
        break
      case SubCommandHook.AFTER_COMPLETED:
        this.afterCompletedHooks.push(hook as ServeCommandAfterCompletedHook)
        break
    }
    return this
  }

  public get defaultOptions(): ServeCmdOptions {
    const defaultOptions: ServeCmdOptions = {
      host: {
        value: '127.0.0.1',
        userSpecified: false,
      },
      port: {
        value: 8080,
        userSpecified: false,
        coverFunc: coverInteger,
      },
      mockRequiredOnly: {
        value: false,
        userSpecified: false,
      },
      mockOptionalsAlways: {
        value: false,
        userSpecified: false,
      },
      mockOptionalsProbability: {
        value: 0.8,
        userSpecified: false,
      },
      mockDataFileFirst: {
        value: false,
        userSpecified: false,
      },
      mockDataFileRootPath: {
        value: undefined,
        userSpecified: false,
        coverFunc: coverString as CoverOperationFunc<string | undefined>,
      },
    }
    return defaultOptions
  }
}
