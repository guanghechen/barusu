import path from 'path'
import {
  DEBUG,
  calcLoggerOptionsFromArgs,
  registerCommanderOptions,
} from '../src'


describe('command funcs', function () {
  test('generateOptions', function () {
    const logFilepath = path.resolve(__dirname, 'command.log')
    expect(
      calcLoggerOptionsFromArgs([
        '--log-level=debug',
        '--log-name=waw',
        '--log-mode=loose',
        '--log-flag=date',
        '--log-flag=no-inline',
        '--log-flag',
        'no-colorful',
        '--log-filepath',
        logFilepath,
        '--log-encoding=utf-8',
      ])
    ).toEqual({
      level: DEBUG,
      name: 'waw',
      mode: 'loose',
      date: true,
      inline: false,
      colorful: false,
      filepath: logFilepath,
      encoding: 'utf-8'
    })
  })

  test('registerCommanderOptions', function () {
    const infos: any[] = []

    const program = {
      option: (...args: any[]) => {
        infos.push(args)
        return program
      }
    }

    registerCommanderOptions(program)
    expect(infos).toMatchSnapshot('registered options')
  })
})
