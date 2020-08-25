import chalk from 'chalk'
import fs from 'fs-extra'
import globby from 'globby'
import path from 'path'
import { name } from '@barusu/tool-restful-api/package.json'
import { absoluteOfWorkspace } from '@barusu/util-cli'
import rimraf from 'rimraf'
import {
  COMMAND_NAME,
  RestfulApiGenerateContext,
  RestfulApiGenerateProcessor,
  SubCommandGenerateOptions,
  createProgram,
  createRestfulApiGenerateContext,
  createSubCommandGenerate,
} from '../src'


describe('generate', function () {
  const caseRootDirectory = path.resolve(__dirname, 'cases', 'generate')
  const kases = fs.readdirSync(caseRootDirectory)

  for (const kase of kases) {
    const title = kase
    const projectDir = absoluteOfWorkspace(caseRootDirectory, kase)

    test(title, async function () {
      const program = createProgram()
      const promise = new Promise((resolve, reject) => {
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

            try {
              const processor = new RestfulApiGenerateProcessor(context)
              await processor.generate()
              resolve()
            } catch (error) {
              reject(error)
            }
          },
        ))
      })

      const schemaRootDir = '__tmp__/schemas/output'
      const absoluteSchemaRootDir = absoluteOfWorkspace(projectDir, schemaRootDir)

      // clear output directory before run test
      rimraf.sync(absoluteSchemaRootDir)

      const args = [
        '',
        COMMAND_NAME,
        'generate',
        projectDir,
        '--log-level=warn',
        '--config-path=app.yml',
        '--api-config-path=api.yml',
        '--schema-root-path=' + schemaRootDir,
      ]
      console.log(chalk.gray('--> ' + args.join(' ')))
      program.parse(args)

      // waiting the program finished
      await promise

      // write the outputs to snapshots
      const files = (await globby(['*', '**/*'], {
        cwd: absoluteSchemaRootDir,
        onlyFiles: true,
        expandDirectories: false,
      })).sort()

      expect(files).toMatchSnapshot('schema files')
      for (const filepath of files) {
        const absoluteFilepath = absoluteOfWorkspace(absoluteSchemaRootDir, filepath)
        const content: string = await fs.readJSON(absoluteFilepath)
        expect(content).toMatchSnapshot(filepath)
      }
    })
  }
})
