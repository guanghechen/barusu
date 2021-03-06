import { createLoggerMocker } from '@barusu/util-jest'
import fs from 'fs-extra'
import path from 'path'
import { COMMAND_NAME, createProgram, execSubCommandStat, logger } from '../src'

describe('stat', function () {
  const caseRootDirectory = path.resolve(__dirname, 'cases', 'files')
  const workspaceRootDir: string = path.resolve(__dirname, '..')

  const kases = fs.readdirSync(caseRootDirectory)
  for (const kase of kases) {
    const { name: title } = path.parse(kase)
    const projectDir = caseRootDirectory
    const filepath = kase

    // eslint-disable-next-line jest/valid-title
    test(title, async function () {
      const loggerMock = createLoggerMocker({ logger, workspaceRootDir })
      loggerMock.mock()

      const program = createProgram()
      const args = [
        '',
        COMMAND_NAME,
        'stat',
        projectDir,
        '-f',
        filepath,
        '--log-level=debug',
      ]

      await execSubCommandStat(program, args)

      expect(loggerMock.data()).toMatchSnapshot('log info')
      loggerMock.restore()
    })
  }
})
