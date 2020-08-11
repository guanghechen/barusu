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
   * path of index file of ciphertext files
   */
  readonly indexFilepath: string
  /**
   * the directory where the encrypted files are stored
   */
  readonly ciphertextRootDir: string
  /**
   * the directory where the source plaintext files are stored
   */
  readonly plaintextRootDir: string
  /**
   * url of source repository of plaintext files are located
   */
  readonly plaintextRepositoryUrl: string
  /**
   * whether to print password asterisks
   */
  readonly showAsterisk: boolean
  /**
   * the minimum size required of password
   */
  readonly minPasswordLength: number
  /**
   * the maximum size required of password
   */
  readonly maxPasswordLength: number
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
   * path of index file of ciphertext files
   */
  readonly indexFilepath: string
  /**
   * the directory where the encrypted files are stored
   */
  readonly ciphertextRootDir: string
  /**
   * the directory where the source plaintext files are stored
   */
  readonly plaintextRootDir: string
  /**
   * url of source repository of plaintext files are located
   */
  readonly plaintextRepositoryUrl: string
  /**
   * whether to print password asterisks
   */
  readonly showAsterisk: boolean
  /**
   * the minimum size required of password
   */
  readonly minPasswordLength: number
  /**
   * the maximum size required of password
   */
  readonly maxPasswordLength: number
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
    indexFilepath: params.indexFilepath,
    ciphertextRootDir: params.ciphertextRootDir,
    plaintextRootDir: params.plaintextRootDir,
    plaintextRepositoryUrl: params.plaintextRepositoryUrl,
    showAsterisk: params.showAsterisk,
    minPasswordLength: params.minPasswordLength,
    maxPasswordLength: params.maxPasswordLength,
  }
  return context
}
