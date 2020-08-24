import chalk from 'chalk'
import path from 'path'
import { name } from '@barusu/tool-restful-api/package.json'
import {
  ApiItemParser,
  COMMAND_NAME,
  RestfulApiGenerateContext,
  RestfulApiGenerateProcessor,
  SubCommandGenerateOptions,
  createProgram,
  createRestfulApiGenerateContext,
  createSubCommandGenerate,
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
    const program = createProgram()
    program.addCommand(createSubCommandGenerate(
      name,
      async (options: SubCommandGenerateOptions): Promise<void> => {
        const context: RestfulApiGenerateContext = await createRestfulApiGenerateContext({
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

        const processor = new RestfulApiGenerateProcessor(context)
        await processor.generate()
      },
    ))

    const projectDir = kase.dir
    const args = [
      '',
      COMMAND_NAME,
      'generate',
      projectDir,
      '--log-level=debug',
      '--config-path=app.yml',
      '--api-config-path=api.yml',
      '--schema-root-path=schemas/answer',
    ]
    console.log(chalk.gray('--> ' + args.join(' ')))
    program.parse(args)
  })
}


answer()
