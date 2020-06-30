import commander from 'commander'
import { AppContextConfig, GlobalContextConfig } from './context'
import { CmdOptions, GlobalCmdOptions } from './option'


/**
 * hooks of sub-command
 */
export enum SubCommandHook {
  /**
   * run after the sub-command triggered (before then BEFORE_START)
   */
  AFTER_TRIGGERED = 'AFTER-TRIGGERED',
  /**
   * run before the sub-command execute
   */
  BEFORE_START = 'BEFORE-START',
  /**
   * run after the sub-command completed
   */
  AFTER_COMPLETED = 'AFTER-COMPLETED',
}


/**
 * sub command
 */
export interface SubCommand<T extends keyof AppContextConfig, O extends CmdOptions> {
  /**
   * the name of sub-command
   */
  readonly name: T
  /**
   * default CmdOptions (getter)
   */
  readonly defaultOptions: O
  /**
   * mount current sub-command to commander
   * @param program                   instance of commander
   * @param globalCmdOptions          global command options
   * @param calcGlobalContextConfig   function to calculate global context configuration
   * @param calcContextConfig         function to calculate sub-command context configuration
   */
  mount(
    program: commander.Command,
    globalCmdOptions: GlobalCmdOptions,
    calcGlobalContextConfig: (projectDir: string) => GlobalContextConfig,
    calcContextConfig: (
      projectDir: string,
      cmdOptions: CmdOptions,
      ignoredKeys?: (keyof CmdOptions)[],
    ) => Exclude<AppContextConfig[T], undefined>,
  ): void
  /**
   * execute codes on specified type of hook
   * @param type
   * @param task
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  onHook(type: SubCommandHook, task: Function): this
}
