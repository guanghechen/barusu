import path from 'path'
import { Logger } from '../src/logger'


interface LogMock {
  mock: () => void
  restore: () => void
  data: () => string[][]
}


export function createLoggerMock(
  logger: Logger,
  formatter?: (text: string) => string,
): LogMock {
  const cliInfos: string[][] = []
  const workspaceRootDir = path.resolve(__dirname, '../../../')

  const collectLog = (...args: any[]) => {
    cliInfos.push(args.map(x => {
      const text = typeof x === 'string' ? x : JSON.stringify(x)
      if (formatter != null) return formatter(text)
      return text
        .replace(workspaceRootDir, '<workspaceRootDir>')
        .replace(/\d{4}\-\d{2}\-\d{2} \d{2}:\d{2}:\d{2}/, '$1<Date>')
    }))
  }

  let writeMock: jest.MockInstance<any, any>
  let consoleLogMock: jest.MockInstance<any, any>

  // mock logger
  const mock = (): void => {
    writeMock = jest
      .spyOn(logger, 'write')
      .mockImplementation(collectLog)
    consoleLogMock = jest
      .spyOn(global.console, 'log')
      .mockImplementation(collectLog)
  }

  // restore mock
  const restore = (): void => {
    if (writeMock != null) writeMock.mockRestore()
    if (consoleLogMock != null) consoleLogMock.mockRestore()
  }

  const data = () => cliInfos
  return { mock, restore, data }
}
