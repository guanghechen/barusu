import fs from 'fs-extra'
import path from 'path'
import { createLoggerMocker } from '@barusu/util-jest'
import { COMMAND_NAME, execMainCommand, logger } from '../src'


describe('stat', function () {
  const caseRootDirectory = path.resolve(__dirname, 'cases', 'files')
  const configFilepath = path.resolve(__dirname, 'cases', 'config.json')

  const kases = fs.readdirSync(caseRootDirectory)

  for (const kase of kases) {
    const { name: title } = path.parse(kase)
    const projectDir = caseRootDirectory
    const filepath = kase
    const absoluteFilepath = path.resolve(caseRootDirectory, filepath)

    test(title, async function () {
      const workspaceRootDir: string = path.resolve(__dirname, '..')
      const loggerMock = createLoggerMocker({ logger, workspaceRootDir })
      loggerMock.mock()

      const fsWriteFileSyncMock = jest
        .spyOn(fs, 'writeFileSync')
        .mockImplementation(function (
          absolutePath: string | any,
          resolveContent: string | any,
          encoding: string | any
        ) {
          expect(absolutePath).toEqual(absoluteFilepath)
          expect(encoding).toEqual('utf-8')
          expect(resolveContent).toMatchSnapshot(`[${ filepath }] resolved content`)
        })

      const args = [
        '',
        COMMAND_NAME,
        projectDir,
        '--pattern',
        absoluteFilepath,
        '-c',
        configFilepath,
        '--log-level=debug',
      ]

      await execMainCommand(args)

      expect(loggerMock.data()).toMatchSnapshot('log info')
      loggerMock.restore()
      fsWriteFileSyncMock.mockRestore()
    })
  }
})
