import { version } from '@barusu/tool-sort-imports/package.json'
import program from 'commander'
import fs from 'fs-extra'
import glob from 'glob'
import path from 'path'
import { StaticImportStatement } from './index'
import { logger } from './util'


program
  .version(version)

logger.registerToCommander(program)


program
  .name('sort-imports')
  .usage('[glob pattern of source file] [options]')
  .arguments('[glob pattern of source file]')
  .option('-e, --encoding <encoding>', 'encoding of source file', 'utf-8')
  .option('--max-column <maxColumn>', 'maximum column width', 100 as any)
  .option('--indent <indent>', 'indent of source codes', '  ')
  .option('--quote <quote>', 'quotation marker surround the module path', '\'')
  .action(function (cmd, options: any) {
    const pattern: string = options.args[0] || 'packages/**/src/**/*.{ts,tsx}'
    const {
      quote,
      indent,
      encoding = 'utf-8',
      maxColumn = 100,
    } = options

    logger.debug('quote:', quote)
    logger.debug('indent:', indent)
    logger.debug('encoding:', encoding)
    logger.debug('maxColumn:', maxColumn)

    const stat = new StaticImportStatement(quote, indent, Number.parseInt(maxColumn))
    glob(pattern, (err, matches) => {
      if (err) {
        throw err
      }
      for (const m of matches) {
        const absolutePath = path.resolve(m)
        logger.debug('absolutePath:', absolutePath)

        const content: string = fs.readFileSync(absolutePath, encoding).toString()
        const resolvedContent: string = stat.process(content)
        if (content !== resolvedContent) {
          logger.info('processing:', absolutePath)
        }
        fs.writeFileSync(absolutePath, resolvedContent, encoding)
      }
    })
  })
  .parse(process.argv)
