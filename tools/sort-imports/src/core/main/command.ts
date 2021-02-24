import {
  Command,
  CommandConfigurationFlatOpts,
  MainCommandCreator,
  MainCommandProcessor,
} from '@barusu/util-cli'
import {
  cover,
  coverBoolean,
  coverNumber,
  isNotEmptyArray,
  isNotEmptyString,
} from '@barusu/util-option'
import { packageName } from '../../env/constant'
import { logger } from '../../env/logger'
import { ModuleRankItem } from '../../util/module-rank'
import { createProgram } from '../command'
import { SortImportsContext, createSortImportsContext } from '../main/context'
import {
  GlobalCommandOptions,
  __defaultGlobalCommandOptions,
  resolveGlobalCommandOptions,
} from '../option'


interface SubMainCommandOptions extends GlobalCommandOptions {
  /**
   * encoding of source file
   */
  readonly encoding: string
  /**
   * glob pattern of source file
   */
  readonly pattern: string[]
  /**
   * maximum column width
   */
  readonly maxColumn: number
  /**
   * indent of import/export statements in source codes
   */
  readonly indent: string
  /**
   * quotation marker surround the module path
   */
  readonly quote: string
  /**
   * whether to add a semicolon at the end of import/export statement
   */
  readonly semicolon: boolean
  /**
   * Whether the the type import/export statements rank ahead
   */
  readonly typeFirst: boolean
  /**
   * Rank patterns of module names
   */
  readonly moduleRanks: ModuleRankItem[]
  /**
   * Blank lines after statement.
   * @default 2
   */
  readonly blankLinesAfterStatement: number
}


const __defaultCommandOptions: SubMainCommandOptions = {
  ...__defaultGlobalCommandOptions,
  pattern: [],
  encoding: 'utf-8',
  maxColumn: 80,
  indent: '  ',
  quote: '\'',
  semicolon: false,
  typeFirst: true,
  moduleRanks: [],
  blankLinesAfterStatement: 2,
}


export type MainCommandOptions = SubMainCommandOptions & CommandConfigurationFlatOpts


/**
 * create main command
 */
export const createMainCommand: MainCommandCreator<MainCommandOptions> =
  function (
    handle?: MainCommandProcessor<MainCommandOptions>
  ): Command {
    const command = createProgram()

    command
      .usage('<workspace> [options]')
      .arguments('<workspace>')
      .option('-P, --pattern <pattern>', 'glob pattern of source file', (val, acc: string[]) => acc.concat(val), [])
      .option('-e, --encoding <encoding>', 'encoding of source file')
      .option('--max-column <maxColumn>', 'maximum column width')
      .option('--indent <indent>', 'indent of source codes')
      .option('--quote <quote>', 'quotation marker surround the module path')
      .option('--semicolon', 'whether to add a semicolon at the end of import/export statement')
      .option('--type-first', 'whether the the type import/export statements rank ahead')
      .option('--blank-line-after-statement', 'blank lines after import/export statement')
      .action(async function ([_workspaceDir], options: MainCommandOptions) {
        logger.setName('')

        const defaultOptions: MainCommandOptions = resolveGlobalCommandOptions(
          packageName, false, __defaultCommandOptions, _workspaceDir, options)

        // resolve encoding
        const encoding: string = cover<string>(
          defaultOptions.encoding, options.encoding, isNotEmptyString)
        logger.debug('encoding:', encoding)

        // resolve pattern
        const pattern: string[] = cover<string[]>(
          defaultOptions.pattern, options.pattern, isNotEmptyArray)
        logger.debug('pattern:', pattern)

        // resolve quote
        const quote: string = cover<string>(
          defaultOptions.quote, options.quote, isNotEmptyString)
        logger.debug('quote:', quote)

        // resolve semicolon
        const semicolon: boolean = coverBoolean(
          defaultOptions.semicolon, options.semicolon)
        logger.debug('semicolon:', semicolon)

        // resolve typeFirst
        const typeFirst: boolean = coverBoolean(
          defaultOptions.typeFirst, options.typeFirst)
        logger.debug('typeFirst:', typeFirst)

        // resolve indent
        const indent: string = cover<string>(
          defaultOptions.indent, options.indent, isNotEmptyString)
        logger.debug('indent:', indent.replace(/[ ]/g, '_').replace(/[\t]/g, '\\t'))

        // resolve maxColumn
        const maxColumn: number = coverNumber(
          defaultOptions.maxColumn, options.maxColumn)
        logger.debug('maxColumn:', maxColumn)

        // resolve moduleRanks
        const moduleRanks: ModuleRankItem[] = cover<ModuleRankItem[]>(
          defaultOptions.moduleRanks, options.moduleRanks, isNotEmptyArray)
        logger.debug('moduleRanks:', moduleRanks)

        // resolve blankLinesAfterStatement
        const blankLinesAfterStatement: number = Math.max(
          0,
          coverNumber(
            defaultOptions.blankLinesAfterStatement,
            options.blankLinesAfterStatement,
            isNotEmptyString
          )
        )

        // parse regex in moduleRanks
        if (moduleRanks != null) {
          if (!Array.isArray(moduleRanks)) {
            throw new Error('[Bad option] moduleRanks should be array.')
          }

          for (let i = 0; i < moduleRanks.length; ++i) {
            const item = moduleRanks[i]
            if (
              item == null ||
              (typeof item.regex !== 'string') ||
              (typeof item.rank !== 'number')
            ) {
              throw new Error(`[Bad option] missed regex / rank in moduleRanks[${ i }]: ${ JSON.stringify(item) }`)
            }
            item.regex = new RegExp(item.regex)
          }
        }

        const resolvedOptions: MainCommandOptions = {
          ...defaultOptions,
          pattern,
          quote,
          semicolon,
          typeFirst,
          indent,
          encoding,
          maxColumn,
          moduleRanks,
          blankLinesAfterStatement,
        }

        if (handle != null) {
          await handle(resolvedOptions)
        }
      })

    return command
  }


/**
 * Create SortImportsContext
 * @param options
 */
export async function createSortImportsContextFromOptions(
  options: MainCommandOptions,
): Promise<SortImportsContext> {
  const context: SortImportsContext = await createSortImportsContext({
    cwd: options.cwd,
    workspace: options.workspace,
    encoding: options.encoding,
    pattern: options.pattern,
    maxColumn: options.maxColumn,
    indent: options.indent,
    quote: options.quote,
    semicolon: options.semicolon,
    typeFirst: options.typeFirst,
    moduleRanks: options.moduleRanks,
    blankLinesAfterStatement: options.blankLinesAfterStatement,
  })
  return context
}
