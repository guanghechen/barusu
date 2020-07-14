import { describe, it } from 'mocha'
import chalk from 'chalk'
import path from 'path'
import { name } from '@barusu/tool-restful-api/package.json'
import {
  COMMAND_NAME,
  RestfulApiGenerator,
  RestfulApiGeneratorContext,
  SubCommandGenerateOptions,
  createProgram,
  createRestfulApiGeneratorContext,
  createSubCommandGenerate,
} from '../src'
import { CommandTestCaseMaster } from './util/command-case-util'


it('This is a required placeholder to allow before() to work', () => { })
before(async function test() {
  const caseRootDirectory = path.resolve('test/cases')
  const caseMaster = new CommandTestCaseMaster({ caseRootDirectory })
  await caseMaster.scan('sub-command/generate/simple')
  describe('SubCommand:generate test cases', function () {
    this.timeout(5000)
    caseMaster.test(function* (kase) {
      yield kase.title
      yield function (): Promise<void> {
        return new Promise(resolve => {
          const program = createProgram()
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

              // test whether the result is matched with the answer
              const outputPath = path.resolve(projectDir, 'schemas/output')
              const answerPath = path.resolve(projectDir, 'schemas/answer')
              caseMaster.compareDirs(outputPath, answerPath)

              resolve()
            },
          ))

          const projectDir = kase.dir
          const args = [
            '',
            COMMAND_NAME,
            'generate',
            projectDir,
            '--log-level=warn',
            '--config-path=app.yml',
            '--api-config-path=api.yml',
            '--schema-root-path=schemas/output',
          ]
          console.log(chalk.gray('--> ' + args.join(' ')))
          program.parse(args)
        })
      }
    })
  })
})
