import type { Mocker } from './types'
import { desensitize } from './util'

export type LoggerMocker = Mocker<string[][]>

interface Logger {
  write(text: string): void
}

interface CreateLoggerMockParams {
  /**
   *
   */
  logger: Logger
  /**
   * Root path of log information output
   */
  workspaceRootDir: string
  /**
   * Whether to also monitor global.console
   */
  spyOnGlobalConsole?: boolean
  /**
   * Custom formatter for formatting log content
   */
  formatter?(text: string): string
}

/**
 * Create a LogMocker
 * @param logger
 * @param formatter
 */
export function createLoggerMocker({
  logger,
  workspaceRootDir,
  spyOnGlobalConsole = true,
  formatter,
}: CreateLoggerMockParams): LoggerMocker {
  let cliInfos: string[][] = []
  const collectLog = (...args: any[]): void => {
    cliInfos.push(
      args.map(x => {
        const text = typeof x === 'string' ? x : JSON.stringify(x)
        if (formatter != null) return formatter(text)
        return desensitize(text, workspaceRootDir)
      }),
    )
  }

  let writeMock: jest.MockInstance<any, any>
  let consoleLogMock: jest.MockInstance<any, any>

  // mock logger
  const mock = (): void => {
    writeMock = jest.spyOn(logger, 'write').mockImplementation(collectLog)
    if (spyOnGlobalConsole) {
      consoleLogMock = jest
        .spyOn(global.console, 'log')
        .mockImplementation(collectLog)
    }
  }

  // restore mock
  const restore = (): void => {
    if (writeMock != null) writeMock.mockRestore()
    if (consoleLogMock != null) consoleLogMock.mockRestore()
  }

  // discard data
  const reset = (data?: string[][]): void => {
    cliInfos = data || []
  }

  const data = (): string[][] => cliInfos
  return { mock, restore, reset, data }
}
