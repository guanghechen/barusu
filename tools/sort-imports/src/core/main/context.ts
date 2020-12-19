import { ModuleRankItem } from '../../util/module-rank'
import { StaticModuleStatementItem } from '../../util/module-statement'


export interface SortImportsContext {
  /**
   * Path of currently executing command
   */
  readonly cwd: string
  /**
   * Working directory
   */
  readonly workspace: string
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
   * Rank of 'import' and 'export'
   */
  readonly typeRank: Record<StaticModuleStatementItem['type'], number>
}


interface Params {
  /**
   * Path of currently executing command
   */
  readonly cwd: string
  /**
   * Working directory
   */
  readonly workspace: string
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
   * Rank of 'import' and 'export'
   */
  readonly typeRank?: Record<StaticModuleStatementItem['type'], number>
}


/**
 * Create SortImportsContext
 *
 * @param params
 */
export async function createSortImportsContext(
  params: Params
): Promise<SortImportsContext> {
  const context: SortImportsContext = {
    cwd: params.cwd,
    workspace: params.workspace,
    encoding: params.encoding,
    pattern: params.pattern,
    maxColumn: params.maxColumn,
    indent: params.indent,
    quote: params.quote,
    semicolon: params.semicolon,
    typeFirst: params.typeFirst,
    moduleRanks: params.moduleRanks,
    typeRank: params.typeRank != null ? params.typeRank : { 'import': 1, 'export': 2 },
  }
  return context
}
