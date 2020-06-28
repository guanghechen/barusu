import fs from 'fs-extra'
import path from 'path'
import { logger } from './logger'


/**
 * If the give file path does not exist, then create it.
 * @param filepath  the give file path
 * @param isDir     Whether the given path is a directory
 */
export function mkdirsIfNotExists(filepath: string, isDir: boolean): void {
  const dirPath = isDir ? filepath : path.dirname(filepath)
  if (fs.existsSync(dirPath)) return
  logger.verbose(`mkdirs: ${ dirPath }`)
  fs.mkdirsSync(dirPath)
}
