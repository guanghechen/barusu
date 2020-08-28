import fs from 'fs-extra'
import globby from 'globby'
import path from 'path'
import rimraf from 'rimraf'
import { name } from '@barusu/tool-restful-api/package.json'
import { absoluteOfWorkspace } from '@barusu/util-cli'
import {
  COMMAND_NAME,
  RestfulApiGenerateContext,
  RestfulApiGenerateProcessor,
  SubCommandGenerateOptions,
  createProgram,
  createRestfulApiGenerateContextFromOptions,
  createSubCommandGenerate,
} from '../src'


describe('generate', function () {
  const caseRootDirectory = path.resolve(__dirname, 'cases', 'mock-workspaces')
  const kases = fs.readdirSync(caseRootDirectory)

  for (const kase of kases) {
    const title = kase
    const projectDir = absoluteOfWorkspace(caseRootDirectory, kase)

    // clear output directory before run test
    const schemaRootDir = '__tmp__/schemas/output'
    const absoluteSchemaRootDir = absoluteOfWorkspace(projectDir, schemaRootDir)
    rimraf.sync(absoluteSchemaRootDir)

    test(title, async function () {
      const program = createProgram()
      const promise = new Promise<RestfulApiGenerateContext>(resolve => {
        program.addCommand(createSubCommandGenerate(
          name,
          async (options: SubCommandGenerateOptions): Promise<void> => {
            const context: RestfulApiGenerateContext =
              await createRestfulApiGenerateContextFromOptions(options)
            resolve(context)
          }
        ))
      })

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

      program.parse(args)

      const context = await promise
      const processor = new RestfulApiGenerateProcessor(context)
      await processor.generate()

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
