import fs from 'fs-extra'
import path from 'path'
import { Level } from '@barusu/chalk-logger'
import { name, version } from '@barusu/tool-sort-imports/package.json'
import program from 'commander'
import globby from 'globby'
import { StaticImportStatement } from './index'
import { logger } from './util'


program
  .version(version)

logger.registerToCommander(program)


program
  .name('sort-imports')
  .usage('<cwd> [options]')
  .arguments('<cwd>')
  .option('-P, --pattern <pattern>', 'glob pattern of source file', (val, acc: string[]) => acc.concat(val), [])
  .option('-e, --encoding <encoding>', 'encoding of source file')
  .option('--max-column <maxColumn>', 'maximum column width')
  .option('--indent <indent>', 'indent of source codes')
  .option('--quote <quote>', 'quotation marker surround the module path')
  .option('-M, --top-module <moduleName>', 'top modules', (val, acc: string[]) => acc.concat(val), [])
  .action(function (cmd, options: any) {
    const cwd: string = options.args[0] || path.resolve()
    const packageJsonPath = path.resolve(cwd, 'package.json')

    let defaultOptions = {
      logLevel: undefined,
      pattern: [],
      encoding: 'utf-8',
      maxColumn: 100,
      indent: '  ',
      quote: '\'',
      topModule: [],
    }

    if (fs.existsSync(packageJsonPath)) {
      // read default options
      const packageJson = fs.readJSONSync(packageJsonPath)
      if (packageJson[name] != null) {
        defaultOptions = {
          ...defaultOptions,
          ...packageJson[name],
        }
      }
    }

    /**
     * remove undefined options to eliminate the overwrite effect on the default options
     */
    if (options.pattern.length <= 0) {
      // eslint-disable-next-line no-param-reassign
      delete options.pattern
    }
    if (options.topModule.length <= 0) {
      // eslint-disable-next-line no-param-reassign
      delete options.topModule
    }

    const {
      logLevel = defaultOptions.logLevel,
      pattern = defaultOptions.pattern,
      quote = defaultOptions.quote,
      indent = defaultOptions.indent,
      encoding = defaultOptions.encoding,
      maxColumn = defaultOptions.maxColumn,
      topModule = defaultOptions.topModule,
    } = options

    // reset log-level
    if (logLevel != null) {
      const level = Level.valueOf(logLevel)
      if (level != null) logger.setLevel(level)
    }

    logger.debug('packageJsonPath:', packageJsonPath)
    logger.debug('pattern:', pattern)
    logger.debug('quote:', quote)
    logger.debug('indent:', indent)
    logger.debug('encoding:', encoding)
    logger.debug('maxColumn:', maxColumn)
    logger.debug('topModule:', topModule)

    const stat = new StaticImportStatement(quote, indent, Number.parseInt(maxColumn), topModule)
    globby(pattern, {
      onlyFiles: true,
      expandDirectories: false,
    })
      .then(matchedPaths => {
        for (const m of matchedPaths) {
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
      .catch(err => {
        if (err) {
          throw err
        }
      })
  })
  .parse(process.argv)
