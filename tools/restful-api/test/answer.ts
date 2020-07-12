import chalk from 'chalk'
import path from 'path'
import { name, version } from '@barusu/tool-restful-api/package.json'
import { createTopCommand } from '@barusu/util-cli'
import {
  ApiItemParser,
  COMMAND_NAME,
  RestfulApiGenerator,
  RestfulApiGeneratorContext,
  SubCommandGenerateOptions,
  createRestfulApiGeneratorContext,
  createSubCommandGenerate,
  logger,
} from '../src'
import { ApiItemParserTestCaseMaster } from './util/api-parser-case-util'
import { CommandTestCaseMaster } from './util/command-case-util'


/**
 * create answer (to be checked)
 */
async function answer() {
  const caseRootDirectory: string = path.resolve('test/cases')

  // ApiItemParser cases
  const apiItemParser = new ApiItemParser()
  const apiItemParserCaseMaster = new ApiItemParserTestCaseMaster(apiItemParser, { caseRootDirectory })
  await apiItemParserCaseMaster.scan('api-item')
  await apiItemParserCaseMaster.answer()

  // answer sub-command
  const commandCaseMaster = new CommandTestCaseMaster({ caseRootDirectory })
  await commandCaseMaster.scan('sub-command/generate/simple')
  await commandCaseMaster.answer(async kase => {
    const program = createTopCommand(COMMAND_NAME, version, logger)
    program.addCommand(createSubCommandGenerate(
      name,
      async (options: SubCommandGenerateOptions): Promise<void> => {
        const context: RestfulApiGeneratorContext = await createRestfulApiGeneratorContext({
          cwd: options.cwd,
          workspace: options.workspace,
          tsconfigPath: options.tsconfigPath,
          schemaRootPath: options.schemaRootPath,
          apiConfigPath: options.apiConfigPath,
          encoding: options.encoding,
          clean: options.clean,
          muteMissingModel: options.muteMissingModel,
          ignoredDataTypes: options.ignoredDataTypes,
          additionalSchemaArgs: options.additionalSchemaArgs,
          additionalCompilerOptions: options.additionalCompilerOptions,
        })

        const generator = new RestfulApiGenerator(context)
        await generator.generate()
      },
    ))

    const projectDir = kase.dir
    const args = ['', COMMAND_NAME, 'generate', projectDir, '--log-level=debug', '-s', 'schemas/answer']
    console.log(chalk.gray('--> ' + args.join(' ')))
    program.parse(args)
  })
}


answer()
