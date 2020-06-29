import fs from 'fs-extra'
import path from 'path'
import { Logger } from './types'


/**
 * If the give file path does not exist, then create it.
 * @param filepath  the give file path
 * @param isDir     Whether the given path is a directory
 */
export function mkdirsIfNotExists(
  filepath: string,
  isDir: boolean,
  logger?: Logger
): void {
  const dirPath = isDir ? filepath : path.dirname(filepath)
  if (fs.existsSync(dirPath)) return

  if (logger != null && logger.verbose != null) {
    logger.verbose(`mkdirs: ${ dirPath }`)
  }
  fs.mkdirsSync(dirPath)
}
