/**
 * Context variables for WordCountStatContext
 */
export interface WordCountStatContext {
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
   * Do not display statistics for each file, but only display summary information
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
   * Do not display statistics for each file, but only display summary information
   */
  readonly showSummaryOnly: boolean
}


/**
 * Create WordCountStatContext
 *
 * @param params
 */
export async function createWordCountStatContext(
  params: Params
): Promise<WordCountStatContext> {
  const context: WordCountStatContext = {
    cwd: params.cwd,
    workspace: params.workspace,
    encoding: params.encoding,
    filePath: params.filePath,
    filePattern: params.filePattern,
    showDetails: params.showDetails,
    showSummaryOnly: params.showSummaryOnly,
  }
  return context
}
