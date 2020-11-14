[![npm version](https://img.shields.io/npm/v/@barusu/chalk-logger.svg)](https://www.npmjs.com/package/@barusu/chalk-logger)
[![npm download](https://img.shields.io/npm/dm/@barusu/chalk-logger.svg)](https://www.npmjs.com/package/@barusu/chalk-logger)
[![npm license](https://img.shields.io/npm/l/@barusu/chalk-logger.svg)](https://www.npmjs.com/package/@barusu/chalk-logger)

`chalk-logger` is a colorful logger tool based on [chalk](https://github.com/chalk/chalk)(so you can use a lot of colors) and [commander](https://github.com/tj/commander.js)(so you can use command line parameters to customized the logger's behavior).


# Usage

## Install
  ```shell
  yarn add @barusu/chalk-logger
  ```

## Options
   Name               | Type                    | Required  | Default           |  Desc
  :------------------:|:-----------------------:|:---------:|:-----------------:|:------------------:
   `basename`         | string \| `null`        | `false`   | `null`            | [see below](#option-details)
   `mode`             | `'normal'` \| `'loose'` | `false`   | `normal`          | [see below](#option-details)
   `placeholderRegex` | RegExp                  | `false`   | `/(?<!\\)\{\}/g`  | string formatter placeholder regex
   `name`             | string                  | `false`   | -                 | name of logger
   `level`            | Level                   | `false`   | `Level.INFO`      | verbosity level of the logging output
   `date`             | boolean                 | `false`   | `false`           | whether to print the date
   `title`            | boolean                 | `false`   | `true`            | whether to print the title
   `inline`           | boolean                 | `false`   | `false`           | whether to print each log on one line
   `colorful`         | boolean                 | `false`   | `true`            | whether to print log surrounded with color
   `encoding`         | string                  | `false`   | `utf-8`           | [see below](#option-details)
   `filepath`         | string                  | `false`   | -                 | [see below](#option-details)
   `write`            | (text: string) => void  | `false`   | `process.stdout`  | [see below](#option-details)
   `dateChalk`        | Chalk \| Color          | `false`   | `chalk.gray`      | color of date string
   `nameChalk`        | Chalk \| Color          | `false`   | `chalk.gray`      | color of logger name string

### Option Details
  * `basename`: Base of the logger name, when you change logger name according `setName` function, the basename will be prefixed of the logger name

  * `mode`
    - `normal`: Print log only
    - `loose`: Print a newline before and after the log

  * `encoding`: Specifying the file encoding of `filepath`, only works if `filepath` is specified

  * `filepath`: Log output file

  * `write`: If `filepath` is specified, the log is output to `filepath` by default, otherwise to the `process.stdout`.
    You can specify your own write function to customize the output behavior of the log


## Cli-options
  * `--log-level <debug|verbose|info|warn|error|fatal>`: specify global logger level.
  * `--log-name <new logger name>`: specify global logger name.
  * `--log-mode <'normal' | 'loose'>`: specify global logger mode.
  * `--log-flag <[no-](date|title|inline|colorful)>`: the prefix `no-` represent negation.
    - `date`: whether to print date. default value is false
    - `title`: whether to print title. default value is true
    - `inline`: each log record output in one line. default value is false.
    - `colorful`: whether to print with colors. default value is true.
  * `--log-output <filepath>`: specify the output path (default behavior is output directory to stdout).
    - suggest: set `colorful = false` and `inline = true` if you want to output logs into a file.
  * `--log-encoding <encoding>`: specify the log file's encoding.


## Example
```typescript
// demo/demo1.ts
import { ChalkLogger, ERROR } from 'chalk-logger'


const logger = new ChalkLogger({
  name: 'demo',
  level: ERROR,   // the default value is INFO
  date: false,    // the default value is false.
  colorful: true, // the default value is true.
}, process.argv)


logger.debug('A', 'B', 'C')
logger.verbose('A', 'B', 'C')
logger.info('a', 'b', 'c')
logger.warn('X', 'Y', 'Z', { a: 1, b: 2})
logger.error('x', 'y', 'z', { c: { a: 'hello' }, b: { d: 'world' } })
logger.fatal('1', '2', '3')
```
![demo1.1.png](https://raw.githubusercontent.com/guanghechen/barusu/master/packages/chalk-logger/screenshots/demo1.1.png)

## Custom output format:
```typescript
// demo/demo2.ts
import chalk from 'chalk'
import { ChalkLogger, ERROR, Level } from 'chalk-logger'


let logger = new ChalkLogger({
  name: 'demo',
  level: ERROR,   // the default value is INFO
  date: false,    // the default value is false.
  colorful: true, // the default value is true.
}, process.argv)


logger.formatHeader = function (level: Level, date: Date): string {
  let { desc } = level
  let { name } = this
  if( this.flags.colorful ) {
    desc = level.headerChalk.fg(desc)
    if (level.headerChalk.bg != null) desc = level.headerChalk.bg(desc)
    name = chalk.gray(name)
  }
  let header = `${desc} ${name}`
  if( !this.flags.date) return `[${header}]`

  let dateString = date.toLocaleTimeString()
  if( this.flags.colorful ) dateString = chalk.gray(dateString)
  return `<${dateString} ${header}>`
}


logger.debug('A', 'B', 'C')
logger.verbose('A', 'B', 'C')
logger.info('a', 'b', 'c')
logger.warn('X', 'Y', 'Z', { a: 1, b: 2})
logger.error('x', 'y', 'z', { c: { a: 'hello' }, b: { d: 'world' } })
logger.fatal('1', '2', '3')
```
![demo2.1.png](https://raw.githubusercontent.com/guanghechen/barusu/master/packages/chalk-logger/screenshots/demo2.1.png)

```typescript
// demo/demo3.ts
import chalk from 'chalk'
import { ChalkLogger, ERROR } from 'chalk-logger'


let logger = new ChalkLogger({
  name: 'demo',
  level: ERROR,     // the default value is INFO
  date: false,      // the default value is false.
  colorful: true,   // the default value is true.
  dateChalk: 'green',
  nameChalk: chalk.cyan.bind(chalk),
}, process.argv)


logger.debug('A', 'B', 'C')
logger.verbose('A', 'B', 'C')
logger.info('a', 'b', 'c')
logger.warn('X', 'Y', 'Z', { a: 1, b: 2})
logger.error('x', 'y', 'z', { c: { a: 'hello' }, b: { d: 'world' } })
logger.fatal('1', '2', '3')
```
![demo3.1.png](https://raw.githubusercontent.com/guanghechen/barusu/master/packages/chalk-logger/screenshots/demo3.1.png)

## output to file
```typescript
// demo/demo4.ts
import path from 'path'
import chalk from 'chalk'
import { ChalkLogger, DEBUG } from 'chalk-logger'


let logger = new ChalkLogger({
  name: 'demo',
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
logger.warn('X', 'Y', 'Z', { a: 1, b: 2})
logger.error('x', 'y', 'z', { c: { a: 'hello' }, b: { d: 'world' } })
logger.fatal('1', '2', '3')
```
![demo4.1.png](https://raw.githubusercontent.com/guanghechen/barusu/master/packages/chalk-logger/screenshots/demo4.1.png)


## register to commander
```typescript
// demo/demo5.ts
import chalk from 'chalk'
import commander from 'Commander'
import { ChalkLogger, ERROR } from '../src'


let logger = new ChalkLogger({
  name: 'demo',
  level: ERROR,     // the default value is INFO
  date: false,      // the default value is false.
  colorful: true,   // the default value is true.
  dateChalk: 'green',
  nameChalk: chalk.cyan.bind(chalk),
}, process.argv)


commander
  .version('v1.0.0')
  .arguments('[orz]')

// register logger option to commander
logger.registerToCommander(commander)
// or ChalkLogger.registerToCommander(commander)

commander
  .option('-e, --encoding <encoding>', 'specified <filepath>\'s encoding')
  .parse(process.argv)


logger.debug('A', 'B', 'C')
logger.verbose('A', 'B', 'C')
logger.info('a', 'b', 'c')
logger.warn('X', 'Y', 'Z', { a: 1, b: 2})
logger.error('x', 'y', 'z', { c: { a: 'hello' }, b: { d: 'world' } })
logger.fatal('1', '2', '3')
```
![demo5.1.png](https://raw.githubusercontent.com/guanghechen/barusu/master/packages/chalk-logger/screenshots/demo5.1.png)


## string format
```typescript
// demo/demo6.ts
import { ChalkLogger, DEBUG } from '../src'


let logger = new ChalkLogger({
  name: 'demo',
  level: DEBUG,
  date: true,
  colorful: true,
  inline: true,
}, process.argv)


logger.verbose('user({})', { username: 'guanghechen', avatar: 'https://avatars0.githubusercontent.com/u/42513619?s=400&u=d878f4532bb5749979e18f3696b8985b90e9f78b&v=4' })
logger.error('bad argument ({}). error({})', { username: 123 }, new Error('username is invalid'))


let logger2 = new ChalkLogger({
  name: 'demo',
  level: DEBUG,
  date: true,
  colorful: true,
  inline: true,
  placeholderRegex: /(?<!\\)\<\>/g  // change placeholder of string format
}, process.argv)

logger2.verbose('user(<>)', { username: 'guanghechen', avatar: 'https://avatars0.githubusercontent.com/u/42513619?s=400&u=d878f4532bb5749979e18f3696b8985b90e9f78b&v=4' })
logger2.error('bad argument (<>). error({})', { username: 123 }, new Error('username is invalid'))
```
![demo6.1.png](https://raw.githubusercontent.com/guanghechen/barusu/master/packages/chalk-logger/screenshots/demo6.1.png)
