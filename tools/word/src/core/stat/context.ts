/**
 * Context variables for WordStatContext
 */
export interface WordStatContext {
  /**
   * Path of currently executing command
   */
  readonly cwd: string
  /**
   * Working directory
   */
  readonly workspace: string
  /**
   * default encoding of files in the workspace
   */
  readonly encoding: string
  /**
   * File path list to be statistically analyzed
   */
  readonly filePath: string[]
  /**
   * File wildcard list to be statistically analyzed
   */
  readonly filePattern: string[]
  /**
   * The number of rows in the word frequency ranking list to be displayed
   */
  readonly showDetails: number
  /**
   * Show details pretty: filter out blank and punctuation characters
   */
  readonly showDetailsPretty: boolean
  /**
   * Do not display statistics for each file,
   * but only display summary information
   */
  readonly showSummaryOnly: boolean
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
   * default encoding of files in the workspace
   */
  readonly encoding: string
  /**
   * File path list to be statistically analyzed
   */
  readonly filePath: string[]
  /**
   * File wildcard list to be statistically analyzed
   */
  readonly filePattern: string[]
  /**
   * The number of rows in the word frequency ranking list to be displayed
   */
  readonly showDetails: number
  /**
   * Show details pretty: filter out blank and punctuation characters
   */
  readonly showDetailsPretty: boolean
  /**
   * Do not display statistics for each file,
   * but only display summary information
   */
  readonly showSummaryOnly: boolean
}

/**
 * Create WordStatContext
 *
 * @param params
 */
export async function createWordStatContext(
  params: Params,
): Promise<WordStatContext> {
  const context: WordStatContext = {
    cwd: params.cwd,
    workspace: params.workspace,
    encoding: params.encoding,
    filePath: params.filePath,
    filePattern: params.filePattern,
    showDetails: params.showDetails,
    showDetailsPretty: params.showDetailsPretty,
    showSummaryOnly: params.showSummaryOnly,
  }
  return context
}
