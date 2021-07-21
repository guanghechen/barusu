import { createLoggerMock } from '@guanghechen/jest-helper'
import fs from 'fs-extra'
import { desensitize } from 'jest.setup'
import path from 'path'
import { COMMAND_NAME, execMainCommand, logger } from '../src'

describe('main', function () {
  const configFilepath = path.resolve(__dirname, 'cases', 'config.json')
  const caseRootDirectory = path.resolve(__dirname, 'cases', 'main')
  const kases: string[] = fs
    .readdirSync(caseRootDirectory)
    .filter(p => fs.statSync(path.resolve(caseRootDirectory, p)).isDirectory())

  for (const kase of kases) {
    const { name: title } = path.parse(kase)
    const projectDir = path.resolve(caseRootDirectory, kase)
    const tsconfigFilepath = path.resolve(projectDir, 'tsconfig.json.txt')

    // eslint-disable-next-line jest/valid-title
    test(title, async function () {
      const loggerMock = createLoggerMock({
        logger,
        desensitize,
      })

      const fsWriteFileSyncMock = jest
        .spyOn(fs, 'writeFile')
        .mockImplementation(function (
          absolutePath: string | any,
          resolveContent: string | any,
          encoding: string | any,
        ) {
          expect(encoding).toEqual('utf-8')
          expect(desensitize(resolveContent)).toMatchSnapshot(
            `[${desensitize(absolutePath)}] resolved content`,
          )
        })

      const args = [
        '',
        COMMAND_NAME,
        projectDir,
        '-c',
        configFilepath,
        '--tsconfig-path',
        tsconfigFilepath,
        '--pattern',
        'src/**.ts',
        '--src-root-dir=src',
        '--dst-root-dir=src',
        '--log-level=debug',
      ]

      await execMainCommand(args)

      expect(loggerMock.getIndiscriminateAll()).toMatchSnapshot('log info')
      fsWriteFileSyncMock.mockRestore()
      loggerMock.restore()
    })
  }
})
