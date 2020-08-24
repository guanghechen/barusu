import { coverString, isNotEmptyString } from '@barusu/util-option'


/**
 * Context variables for RestfulApiInitContext
 */
export interface RestfulApiInitContext {
  /**
   * Path of currently executing command
   */
  readonly cwd: string
  /**
   * Working directory
   */
  readonly workspace: string
  /**
   * Path of tsconfig.json
   */
  readonly tsconfigPath: string
  /**
   * The encoding format of files in the working directory
   */
  readonly encoding: string
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
   * Path of tsconfig.json
   */
  readonly tsconfigPath: string
  /**
   * The encoding format of files in the working directory
   * @default 'utf-8'
   */
  encoding?: string
}


/**
 * Create RestfulApiInitContext
 * @param params
 */
export function createRestfulApiInitContext(
  params: Params
): RestfulApiInitContext {
  const context: RestfulApiInitContext = {
    cwd: params.cwd,
    workspace: params.workspace,
    tsconfigPath: params.tsconfigPath,
    encoding: coverString('utf-8', params.encoding, isNotEmptyString),
  }
  return context
}
