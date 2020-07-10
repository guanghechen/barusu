import fs from 'fs-extra'
import globby from 'globby'
import path from 'path'
import { name, version } from '@barusu/tool-sort-imports/package.json'
import { createTopCommand, resolveCommandOptions } from '@barusu/util-cli'
import {
  cover,
  coverBoolean,
  coverNumber,
  isNotEmptyArray,
  isNotEmptyString,
} from '@barusu/util-option'
import { StaticImportStatement } from './index'
import {
  COMMAND_NAME,
  CommandOptions,
  ModuleRankItem,
  defaultCommandOptions,
  logger,
} from './util'


const program = createTopCommand(
  COMMAND_NAME,
  version,
  logger
)

program
  .usage('<workspace> [options]')
  .arguments('<workspace>')
  .option('-P, --pattern <pattern>', 'glob pattern of source file', (val, acc: string[]) => acc.concat(val), [])
  .option('-e, --encoding <encoding>', 'encoding of source file')
  .option('--max-column <maxColumn>', 'maximum column width')
  .option('--indent <indent>', 'indent of source codes')
  .option('--quote <quote>', 'quotation marker surround the module path')
  .option('--semicolon', 'whether to add a semicolon at the end of import/export statement')
  .action(function (_workspaceDir: string, options: CommandOptions) {
    const defaultOptions = resolveCommandOptions(
      logger, name, false,
      defaultCommandOptions, _workspaceDir, options)

    // resolve pattern
    const pattern: string[] = cover<string[]>(
      defaultOptions.pattern, options.pattern, isNotEmptyArray)
    logger.debug('pattern:', pattern)

    // resolve quote
    const quote: string = cover<string>(defaultOptions.quote, options.quote, isNotEmptyString)
    logger.debug('quote:', quote)

    // resolve semicolon
    const semicolon: boolean = coverBoolean(defaultOptions.semicolon, options.semicolon)
    logger.debug('semicolon:', semicolon)

    // resolve indent
    const indent: string = cover<string>(defaultOptions.indent, options.indent, isNotEmptyString)
    logger.debug('indent:', indent.replace(' ', '_'))

    // resolve encoding
    const encoding: string = cover<string>(defaultOptions.encoding, options.encoding, isNotEmptyString)
    logger.debug('encoding:', encoding)

    // resolve maxColumn
    const maxColumn: number = coverNumber(defaultOptions.maxColumn, options.maxColumn)
    logger.debug('maxColumn:', maxColumn)

    const moduleRanks: ModuleRankItem[] = cover<ModuleRankItem[]>(
      defaultOptions.moduleRanks, options.moduleRanks, isNotEmptyArray)
    logger.debug('moduleRanks:', moduleRanks)

    // parse regex in moduleRanks
    if (moduleRanks != null) {
      if (!Array.isArray(moduleRanks)) {
        logger.error('[Bad option] moduleRanks should be array.')
        process.exit(-1)
      }

      for (let i = 0; i < moduleRanks.length; ++i) {
        const item = moduleRanks[i]
        if (
          item == null ||
          (typeof item.regex !== 'string') ||
          (typeof item.rank !== 'number')
        ) {
          logger.error(`[Bad option] missed regex / rank in moduleRanks[${ i }]: ${ JSON.stringify(item) }`)
          process.exit(-1)
        }
        try {
          item.regex = new RegExp(item.regex)
        } catch (error) {
          logger.error('', error)
          process.exit(-1)
        }
      }
    }


    const stat = new StaticImportStatement(
      quote, indent, semicolon, Number.parseInt(maxColumn as unknown as string), moduleRanks)
    globby(pattern, { onlyFiles: true, expandDirectories: false })
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
