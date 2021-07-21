import { absoluteOfWorkspace } from '@guanghechen/file-helper'
import { coverString } from '@guanghechen/option-helper'
import path from 'path'
import * as TsconfigUtil from 'tsconfig'
import { logger } from '../../env/logger'

export type Paths = Readonly<Record<string, string[]>>

export interface TsconfigPathsContext {
  /**
   * Path of currently executing command
   */
  readonly cwd: string
  /**
   * Working directory
   */
  readonly workspace: string
  /**
   * Encoding of source file
   */
  readonly encoding: string
  /**
   * Glob pattern of source file
   */
  readonly pattern: string[]
  /**
   * Path of tsconfig.json
   */
  readonly tsconfigPath: string
  /**
   * Root path of source file
   */
  readonly srcRootDir: string
  /**
   * Root path of target file
   */
  readonly dstRootDir: string
  /**
   * content of tsconfig
   */
  readonly tsconfigData: any
  /**
   * compilerOptions.rootDir of tsconfig
   */
  readonly tsconfigRootDir: string
  /**
   * compilerOptions.baseUrl of tsconfig
   */
  readonly tsconfigBaseUrl?: string
  /**
   * compilerOptions.paths of tsconfig
   */
  readonly tsconfigPathAlias?: Paths
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
   * Encoding of source file
   */
  readonly encoding: string
  /**
   * Glob pattern of source file
   */
  readonly pattern: string[]
  /**
   * Path of tsconfig.json
   */
  readonly tsconfigPath: string
  /**
   * Root path of source file
   */
  readonly srcRootDir: string
  /**
   * Root path of target file
   */
  readonly dstRootDir: string
}

/**
 * Create TsconfigPathsContext
 *
 * @param params
 */
export async function createTsconfigPathsContext(
  params: Params,
): Promise<TsconfigPathsContext> {
  const { path: configPath, config } = TsconfigUtil.loadSync(
    params.cwd,
    params.tsconfigPath,
  )

  // resolve workspace
  const workspace = coverString(
    params.workspace,
    absoluteOfWorkspace(params.cwd, path.dirname(configPath || '')),
  )
  logger.debug('[createTsconfigPathsContext] workspace:', workspace)

  // resolve tsconfigRootDir
  const tsconfigRootDir: string = coverString(
    '.',
    config?.compilerOptions?.rootDir,
  )
  logger.debug('[createTsconfigPathsContext] tsconfigRootDir:', tsconfigRootDir)

  // resolve tsconfigBaseUrl
  const tsconfigBaseUrl: string | undefined = config?.compilerOptions?.baseUrl
  logger.debug('[createTsconfigPathsContext] tsconfigBaseUrl:', tsconfigBaseUrl)

  // resolve tsconfigPathAlias
  const tsconfigPathAlias: Paths | undefined = config?.compilerOptions?.paths
  logger.debug(
    '[createTsconfigPathsContext] tsconfigPathAlias:',
    tsconfigPathAlias,
  )

  const context: TsconfigPathsContext = {
    cwd: params.cwd,
    workspace,
    encoding: params.encoding,
    pattern: params.pattern,
    tsconfigPath: params.tsconfigPath,
    srcRootDir: params.srcRootDir,
    dstRootDir: params.dstRootDir,
    tsconfigData: config,
    tsconfigRootDir,
    tsconfigBaseUrl,
    tsconfigPathAlias,
  }
  return context
}
