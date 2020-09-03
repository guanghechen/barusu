import fs from 'fs-extra'
import path from 'path'
import {
  COMMAND_NAME,
  createProgram,
  execSubCommandStat,
  logger,
} from '../src'


describe('stat', function () {
  const caseRootDirectory = path.resolve(__dirname, 'cases', 'files')
  const kases = fs.readdirSync(caseRootDirectory)

  for (const kase of kases) {
    const { name: title } = path.parse(kase)
    const projectDir = caseRootDirectory
    const filepath = kase

    test(title, async function () {
      const cliInfos: string[][] = []
      const collectCliInfos = (...args: any[]) => {
        cliInfos.push(args.map(x => JSON.stringify(x)))
      }

      const writeMock = jest
        .spyOn(logger, 'write')
        .mockImplementation(collectCliInfos)
      const consoleLogMock = jest
        .spyOn(global.console, 'log')
        .mockImplementation(collectCliInfos)

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

      const formattedInfos = cliInfos.map(info => (
        info.map(text =>
          text
          .replace(path.resolve(), '<RootDir>')
          .replace(/\d{4}\-\d{2}\-\d{2} \d{2}:\d{2}:\d{2}/, '<Date>')
        )
      ))
      expect(formattedInfos).toMatchSnapshot('log info')

      // restore original funcs
      writeMock.mockRestore()
      consoleLogMock.mockRestore()
    })
  }
})
