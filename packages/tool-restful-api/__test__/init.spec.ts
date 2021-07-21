import { absoluteOfWorkspace } from '@guanghechen/file-helper'
import fs from 'fs-extra'
import globby from 'globby'
import path from 'path'
import { COMMAND_NAME, createProgram, execSubCommandInit } from '../src'

describe('init', function () {
  // clear output directory before run test
  const projectDir = absoluteOfWorkspace(__dirname, '__tmp__/simple')
  fs.removeSync(projectDir)

  test(
    'simple',
    async function () {
      const program = createProgram()
      await execSubCommandInit(program, [
        '',
        COMMAND_NAME,
        'init',
        projectDir,
        '--plop-bypass=simple', // select template
        '--plop-bypass=' + path.basename(projectDir), // package name
        '--plop-bypass=utf-8', // encoding
        '--plop-bypass=verbose', // log level
        '--plop-bypass=skip', // skip 'yarn install'
        '--plop-bypass=no', // skip 'git commit'
        '--log-level=warn',
      ])

      // write the outputs to snapshots
      const files = (
        await globby(['*', '**/*'], {
          cwd: projectDir,
          onlyFiles: true,
          expandDirectories: false,
        })
      ).sort()

      expect(files).toMatchSnapshot('initialized files')
      for (const filepath of files) {
        const absoluteFilepath = absoluteOfWorkspace(projectDir, filepath)
        let content: string = await fs.readFile(absoluteFilepath, 'utf-8')
        if (filepath === 'package.json') {
          content = content.replace(
            /"(@barusu\/[^"\s]+)":\s*"[^"\s]+"/g,
            '"$1": "^latest"',
          )
        }
        expect(content).toMatchSnapshot(filepath)
      }
    },
    1000 * 30,
  )
})
