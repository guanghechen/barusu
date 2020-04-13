import fs from 'fs-extra'
import chalk from 'chalk'
import glob from 'glob'
import minimist from 'minimist'
import path from 'path'
import { StaticImportStatement } from './index'


const prefix = '[tool-sort-imports]'
const LogLevel = {
  DEBUG: 1,
  VERBOSE: 2,
  INFO: 3,
}


async function handle(pattern: string, args: any) {
  const encoding = args.encoding || 'utf-8'
  const logLevel = LogLevel[(args.logLevel || args['log-level'] || 'info').toUpperCase()] || LogLevel.INFO
  const maxColumn = args.maxColumn|| args['max-column']

  const stat = new StaticImportStatement(args.quote, args.indent, maxColumn)
  glob(pattern, (err, matches) => {
    if (err) {
      throw err
    }
    for (const m of matches) {
      const absolutePath = path.resolve(m)
      if (logLevel <= LogLevel.DEBUG) {
        console.debug(chalk.yellow(`${ prefix }: absolutePath(${ absolutePath })`))
      }

      const content: string = fs.readFileSync(absolutePath, encoding).toString()
      const resolvedContent: string = stat.process(content)
      if (content !== resolvedContent) {
        if (logLevel <= LogLevel.INFO) {
          console.debug(chalk.green(`${ prefix } processing: ${ absolutePath }`))
        }
      }
      fs.writeFileSync(absolutePath, resolvedContent, encoding)
    }
  })
}


handle(process.argv[2], minimist(process.argv.slice(2)))
