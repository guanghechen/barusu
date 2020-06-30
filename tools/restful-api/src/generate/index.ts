import commander from 'commander'
import path from 'path'
import { SubCommand, SubCommandHook } from '../core/types/commander'
import {
  GenerateContextConfig,
  GlobalContextConfig,
} from '../core/types/context'
import {
  CmdOptions,
  GenerateCmdOptions,
  GlobalCmdOptions,
} from '../core/types/option'
import { logger } from '../core/util/logger'
import { RestfulApiToolGeneratorContext } from './context'
import { RestfulApiToolGenerator } from './generator'
export * from './context'
export * from './generator'


export type GenerateCommandAfterTriggeredHook = (
  projectDir: string,
  options: GenerateCmdOptions
) => Promise<void> | void

export type GenerateCommandBeforeStartHook = (
  generator: RestfulApiToolGenerator,
  context: RestfulApiToolGeneratorContext,
) => Promise<void> | void

export type GenerateCommandAfterCompletedHook = (
  generator: RestfulApiToolGenerator,
  context: RestfulApiToolGeneratorContext,
) => Promise<void> | void

export type GenerateCommandHook =
  | GenerateCommandAfterTriggeredHook
  | GenerateCommandBeforeStartHook
  | GenerateCommandAfterCompletedHook


/**
 * sub-command `generate`
 */
export class GenerateCommand implements SubCommand<'generate', GenerateCmdOptions> {
  public readonly name = 'generate'
  protected readonly afterTriggeredHooks: GenerateCommandAfterTriggeredHook[] = []
  protected readonly beforeStartHooks: GenerateCommandBeforeStartHook[] = []
  protected readonly afterCompletedHooks: GenerateCommandAfterCompletedHook[] = []

  public mount(
    program: commander.Command,
    globalCmdOptions: GlobalCmdOptions,
    calcGlobalContextConfig: (projectDir: string) => GlobalContextConfig,
    calcContextConfig: (
      projectDir: string,
      cmdOptions: CmdOptions,
      ignoredKeys?: (keyof CmdOptions)[],
    ) => GenerateContextConfig,
  ): void {
    const self = this
    const generateOptions = self.defaultOptions
    const coverGenerateOption = (key: keyof GenerateCmdOptions, value: any) => {
      if (value == null) return
      generateOptions[key] = { value, userSpecified: true } as any
    }

    // init sub-command generate
    program
      .command('generate <project-dir>')
      .alias('g')
      .option('-p, --tsconfig-path <tsconfigPath>', 'specify the location (absolute or relative to the projectDir) of typescript config file.')
      .option('-I, --ignore-missing-models', 'ignore missing model.')
      .option('--clean', 'clean schema folders before generate.')
      .action(async function (projectDir: string, options: GenerateCmdOptions) {
        logger.setName(self.name)

        // execute hook after action triggered
        for (const hook of self.afterTriggeredHooks) {
          await hook(projectDir, options)
        }

        coverGenerateOption('tsconfigPath', options.tsconfigPath)
        coverGenerateOption('ignoreMissingModels', options.ignoreMissingModels)
        coverGenerateOption('clean', options.clean)

        // debug logger
        logger.debug('projectDir:', projectDir)
        logger.debug('[generateOptions] tsconfigPath:', generateOptions.tsconfigPath)
        logger.debug('[generateOptions] ignoreMissingModels:', generateOptions.ignoreMissingModels)
        logger.debug('[generateOptions] clean:', generateOptions.clean)

        // eslint-disable-next-line no-param-reassign
        projectDir = path.resolve(globalCmdOptions.cwd.value, projectDir || '')
        const globalContextConfig = calcGlobalContextConfig(projectDir)
        const contextConfig: GenerateContextConfig = calcContextConfig(projectDir, {
          ...globalCmdOptions,
          ...generateOptions
        })

        // debug logger
        logger.debug('projectDir:', projectDir)
        logger.debug('[generateContextConfig] tsconfigPath:', contextConfig.tsconfigPath)
        logger.debug('[generateContextConfig] ignoreMissingModels:', contextConfig.ignoreMissingModels)
        logger.debug('[generateContextConfig] clean:', contextConfig.clean)
        logger.debug('[generateContextConfig] ignoredDataTypes:', contextConfig.ignoredDataTypes)
        logger.debug('[generateContextConfig] apiConfigPath:', contextConfig.apiConfigPath)
        logger.debug('[generateContextConfig] schemaRootPath:', contextConfig.schemaRootPath)
        logger.debug('[generateContextConfig] encoding:', contextConfig.encoding)
        logger.debug('[generateContextConfig] schemaArgs:', contextConfig.schemaArgs)
        logger.debug('[generateContextConfig] additionalCompilerOptions:', contextConfig.additionalCompilerOptions)

        const context = new RestfulApiToolGeneratorContext(projectDir, globalContextConfig, contextConfig)
        const generator = new RestfulApiToolGenerator(context)

        // execute hook before executing command
        for (const hook of self.beforeStartHooks) {
          await hook(generator, context)
        }

        await generator.generate()

        // execute hook after command completed
        for (const hook of self.afterCompletedHooks) {
          await hook(generator, context)
        }
      })
  }

  public onHook(type: SubCommandHook.AFTER_TRIGGERED, hook: GenerateCommandAfterTriggeredHook): this
  public onHook(type: SubCommandHook.BEFORE_START, hook: GenerateCommandBeforeStartHook): this
  public onHook(type: SubCommandHook.AFTER_COMPLETED, hook: GenerateCommandAfterCompletedHook): this
  public onHook(type: SubCommandHook, hook: GenerateCommandHook): this {
    switch (type) {
      case SubCommandHook.AFTER_TRIGGERED:
        this.afterTriggeredHooks.push(hook as GenerateCommandAfterTriggeredHook)
        break
      case SubCommandHook.BEFORE_START:
        this.beforeStartHooks.push(hook as GenerateCommandBeforeStartHook)
        break
      case SubCommandHook.AFTER_COMPLETED:
        this.afterCompletedHooks.push(hook as GenerateCommandAfterCompletedHook)
        break
    }
    return this
  }


  public get defaultOptions(): GenerateCmdOptions {
    const defaultOptions: GenerateCmdOptions = {
      tsconfigPath: {
        value: 'tsconfig.json',
        userSpecified: false,
      },
      ignoreMissingModels: {
        value: false,
        userSpecified: false,
      },
      clean: {
        value: false,
        userSpecified: false,
      },
    }
    return defaultOptions
  }
}
