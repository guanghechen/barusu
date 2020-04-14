import path from 'path'
import chalk from 'chalk'
import { ColorfulChalkLogger, DEBUG } from '../src'


const logger = new ColorfulChalkLogger('demo', {
  level: DEBUG,       // the default value is DEBUG
  date: true,         // the default value is false.
  inline: true,
  colorful: false,    // the default value is true.
  dateChalk: 'green',
  nameChalk: chalk.cyan.bind(chalk),
  filepath: path.resolve(__dirname, 'orz.log'),
  encoding: 'utf-8',
}, process.argv)


logger.debug('A', 'B', 'C')
logger.verbose('A', 'B', 'C')
logger.info('a', 'b', 'c')
logger.warn('X', 'Y', 'Z', { a: 1, b: 2 })
logger.error('x', 'y', 'z', { c: { a: 'hello' }, b: { d: 'world' } })
logger.fatal('1', '2', '3')
