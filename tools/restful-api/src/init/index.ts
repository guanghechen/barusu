import commander from 'commander'
import path from 'path'
import { SubCommand, SubCommandHook } from '../core/types/commander'
import { GlobalContextConfig, InitContextConfig } from '../core/types/context'
import {
  CmdOptions,
  GlobalCmdOptions,
  InitCmdOptions,
} from '../core/types/option'
import { logger, updateLogName } from '../core/util/logger'
import { RestfulApiToolInitiatorContext } from './context'
import { RestfulApiToolInitiator } from './initiator'
export * from './context'
export * from './initiator'


export type InitCommandAfterTriggeredHook = (
  projectDir: string,
  options: InitCmdOptions
) => Promise<void> | void

export type InitCommandBeforeStartHook = (
  initiator: RestfulApiToolInitiator,
  context: RestfulApiToolInitiatorContext,
) => Promise<void> | void

export type InitCommandAfterCompletedHook = (
  initiator: RestfulApiToolInitiator,
  context: RestfulApiToolInitiatorContext,
) => Promise<void> | void

export type InitCommandHook =
  | InitCommandAfterTriggeredHook
  | InitCommandBeforeStartHook
  | InitCommandAfterCompletedHook


/**
 * sub-command `init`
 */
export class InitCommand implements SubCommand<'init', InitCmdOptions> {
  public readonly name = 'init'
  protected readonly afterTriggeredHooks: InitCommandAfterTriggeredHook[] = []
  protected readonly beforeStartHooks: InitCommandBeforeStartHook[] = []
  protected readonly afterCompletedHooks: InitCommandAfterCompletedHook[] = []

  public mount(
    program: commander.Command,
    globalCmdOptions: GlobalCmdOptions,
    calcGlobalContextConfig: (projectDir: string) => GlobalContextConfig,
    calcContextConfig: (
      projectDir: string,
      cmdOptions: CmdOptions,
      ignoredKeys?: (keyof CmdOptions)[],
    ) => InitContextConfig,
  ): void {
    const self = this
    const initOptions = self.defaultOptions

    // init sub-command init
    program
      .command('init <project-dir>')
      .alias('i')
      .action(async function (projectDir: string, options: InitCmdOptions) {
        updateLogName(self.name)

        // execute hook after action triggered
        for (const hook of self.afterTriggeredHooks) {
          await hook(projectDir, options)
        }

        // debug logger
        logger.debug('projectDir:', projectDir)

        // eslint-disable-next-line no-param-reassign
        projectDir = path.resolve(globalCmdOptions.cwd.value, projectDir || '')
        const globalContextConfig = calcGlobalContextConfig(projectDir)
        const contextConfig: InitContextConfig = calcContextConfig(projectDir, {
          ...globalCmdOptions,
          ...initOptions
        }, [ 'apiConfigPath', 'schemaRootPath', 'encoding'])

        // debug logger
        logger.debug('projectDir:', projectDir)

        const context = new RestfulApiToolInitiatorContext(projectDir, globalContextConfig, contextConfig)
        const Initiator = new RestfulApiToolInitiator(context)

        // execute hook before executing command
        for (const hook of self.beforeStartHooks) {
          await hook(Initiator, context)
        }

        await Initiator.init()

        // execute hook after command completed
        for (const hook of self.afterCompletedHooks) {
          await hook(Initiator, context)
        }
      })
  }

  public onHook(type: SubCommandHook.AFTER_TRIGGERED, hook: InitCommandAfterTriggeredHook): this
  public onHook(type: SubCommandHook.BEFORE_START, hook: InitCommandBeforeStartHook): this
  public onHook(type: SubCommandHook.AFTER_COMPLETED, hook: InitCommandAfterCompletedHook): this
  public onHook(type: SubCommandHook, hook: InitCommandHook): this {
    switch (type) {
      case SubCommandHook.AFTER_TRIGGERED:
        this.afterTriggeredHooks.push(hook as InitCommandAfterTriggeredHook)
        break
      case SubCommandHook.BEFORE_START:
        this.beforeStartHooks.push(hook as InitCommandBeforeStartHook)
        break
      case SubCommandHook.AFTER_COMPLETED:
        this.afterCompletedHooks.push(hook as InitCommandAfterCompletedHook)
        break
    }
    return this
  }


  public get defaultOptions(): InitCmdOptions {
    const defaultOptions: InitCmdOptions = {
    }
    return defaultOptions
  }
}
