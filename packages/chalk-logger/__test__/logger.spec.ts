import { colorToChalk } from '../src/color'
import { DEBUG, Level } from '../src/level'
import { Logger, LoggerOptions } from '../src/logger'
import { createLoggerMock } from './util'


describe('Logger', function () {
  const levels: string[] = ['debug', 'verbose', 'info', 'warn', 'error', 'fatal']
  const methods: string[] = ['debug', 'verbose', 'info', 'warn', 'error', 'fatal']

  describe('base', function () {
    for (const mode of ['normal', 'loose']) {
      for (const level of levels) {
        for (const inline of [false, true]) {
          for (const colorful of [false, true]) {
            for (const date of [false, true]) {
              const options: LoggerOptions = {
                mode: mode as 'normal' | 'loose',
                level: Level.valueOf(level),
                inline,
                colorful,
                date,
              }

              let title = mode + ' ' + level
              if (inline) title += ' +inline'
              if (colorful) title += ' +colorful'
              if (date) title += ' +date'

              test(title, function () {
                const logger = new Logger(level, { ...options })
                const loggerMock = createLoggerMock(logger)
                loggerMock.mock()

                for (const method of methods) {
                  const log = logger[method].bind(logger)
                  log('{}, {}, {}, {}, {}, {}, {}', 1, 'ooo', null, true, false, undefined, 'a\nb')
                  log('This is a literal string', ['a', 'b'])
                  log('Output object: {}', { x: 1, y: { z: 'o' } })
                  log('x', 'y', 'z', { c: { a: 'hello' }, b: { d: 'world' } })
                  log('user(<>)', { username: 'lemon-clown', avatar: 'https://avatars0.githubusercontent.com/u/42513619?s=400&u=d878f4532bb5749979e18f3696b8985b90e9f78b&v=4' })
                }

                expect(loggerMock.data()).toMatchSnapshot()
                loggerMock.restore()
              })
            }
          }
        }
      }
    }
  })

  test('custom' + ' +placeholderRegex', function () {
    const logger = new Logger('complex', {
      mode: 'normal',
      level: DEBUG,
      inline: false,
      colorful: false,
      date: true,
      placeholderRegex: /(?<!\\)\<\>/g, // change placeholder of string format
    })
    const loggerMock = createLoggerMock(logger)
    loggerMock.mock()

    const log = logger.debug.bind(logger)
    log('{}, {}, {}, {}, {}, {}, {}', 1, 'ooo', null, true, false, undefined, () => 'a\nb\n')
    log('<>, <>, <>, <>, <>, <>, <>', 1, 'ooo', null, true, false, undefined, () => 'a\nb\n')
    log('user(<>)', { username: 'lemon-clown', avatar: 'https://avatars0.githubusercontent.com/u/42513619?s=400&u=d878f4532bb5749979e18f3696b8985b90e9f78b&v=4' })

    // Error is hard to test
    log('bad argument (<>). error({})', { username: 123 }, (new Error('username is invalid')).message)

    expect(loggerMock.data()).toMatchSnapshot()
    loggerMock.restore()
  })

  test('custom ' + ' +dateChalk' + ' +nameChalk', function () {
    const logger = new Logger('complex', {
      mode: 'normal',
      level: DEBUG,
      inline: false,
      colorful: true,
      date: true,
      dateChalk: colorToChalk([25, 104, 179], false),
      nameChalk: colorToChalk([25, 104, 179], true),
    })
    const loggerMock = createLoggerMock(logger)
    loggerMock.mock()

    const log = logger.debug.bind(logger)
    log('{}, {}, {}, {}, {}, {}', 1, 'ooo', null, true, false, undefined)
    log('This is a literal string')
    log('Output object: {}', { x: 1, y: { z: 'o' } })
    log('x', 'y', 'z', { c: { a: 'hello' }, b: { d: 'world' } })
    log('user(<>)', { username: 'lemon-clown', avatar: 'https://avatars0.githubusercontent.com/u/42513619?s=400&u=d878f4532bb5749979e18f3696b8985b90e9f78b&v=4' })

    expect(loggerMock.data()).toMatchSnapshot()
    loggerMock.restore()
  })

})
