/**
 * Context variables for GitCipherInitializerContext
 */
export interface GitCipherInitializerContext {
  /**
   * Path of currently executing command
   */
  readonly cwd: string
  /**
   * Working directory
   */
  readonly workspace: string
  /**
   * path of secret file
   */
  readonly secretFilepath: string
  /**
   * the directory where the encrypted files are saved
   */
  readonly cipherRootDir: string
  /**
   * filename of index file of cipher directory
   */
  readonly cipherIndexFilename: string
  /**
   * url of source repository of plaintext files are located
   */
  readonly plainRepositoryUrl: string
  /**
   * whether to print password asterisks
   */
  readonly showAsterisk: boolean
  /**
   * the minimum size required of password
   */
  readonly miniumPasswordLength: number
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
   * path of secret file
   */
  readonly secretFilepath: string
  /**
   * the directory where the encrypted files are saved
   */
  readonly cipherRootDir: string
  /**
   * filename of index file of cipher directory
   */
  readonly cipherIndexFilename: string
  /**
   * url of source repository of plaintext files are located
   */
  readonly plainRepositoryUrl: string
  /**
   * whether to print password asterisks
   */
  readonly showAsterisk: boolean
  /**
   * the minimum size required of password
   */
  readonly miniumPasswordLength: number
}


/**
 * Create GitCipherInitializerContext
 *
 * @param params
 */
export async function createGitCipherInitializerContext(
  params: Params
): Promise<GitCipherInitializerContext> {
  const context: GitCipherInitializerContext = {
    cwd: params.cwd,
    workspace: params.workspace,
    secretFilepath: params.secretFilepath,
    cipherRootDir: params.cipherRootDir,
    cipherIndexFilename: params.cipherIndexFilename,
    plainRepositoryUrl: params.plainRepositoryUrl,
    showAsterisk: params.showAsterisk,
    miniumPasswordLength: params.miniumPasswordLength,
  }
  return context
}
