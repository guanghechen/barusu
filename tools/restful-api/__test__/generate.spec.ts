import fs from 'fs-extra'
import globby from 'globby'
import path from 'path'
import rimraf from 'rimraf'
import { absoluteOfWorkspace } from '@barusu/util-cli'
import { COMMAND_NAME, createProgram, execSubCommandGenerate } from '../src'


describe('generate', function () {
  const caseRootDirectory = path.resolve(__dirname, 'cases', 'mock-workspaces')
  const kases = fs.readdirSync(caseRootDirectory)

  for (const kase of kases) {
    const title = kase
    const projectDir = absoluteOfWorkspace(caseRootDirectory, kase)

    // clear output directory before run test
    const schemaRootDir = 'mock/schemas'
    const absoluteSchemaRootDir = absoluteOfWorkspace(projectDir, schemaRootDir)
    rimraf.sync(absoluteSchemaRootDir)

    test(title, async function () {
      const program = createProgram()
      await execSubCommandGenerate(program, [
        '',
        COMMAND_NAME,
        'generate',
        projectDir,
        '--log-level=warn',
        '--config-path=app.yml',
        '--schema-root-path=' + schemaRootDir,
      ])

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
