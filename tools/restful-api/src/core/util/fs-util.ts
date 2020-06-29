import fs from 'fs-extra'
import { logger } from './logger'


/**
 * check whether p is a file path.
 *
 * @param p   file path
 * @return a boolean value whether p is a file path or not.
 */
export async function isFile(p: string | null): Promise<boolean> {
  if (p == null) return false
  if (!fs.existsSync(p)) return false
  const stat = await fs.stat(p)
  return stat.isFile()
}


/**
 * check whether p is a file path. (synchronizing)
 *
 * @param p   file path
 * @return a boolean value whether p is a file path or not.
 */
export function isFileSync(p: string | null): boolean {
  if (p == null) return false
  if (!fs.existsSync(p)) return false
  const stat = fs.statSync(p)
  return stat.isFile()
}


/**
 * check whether p is a directory path. (synchronizing)
 *
 * @param p   directory path
 * @return a boolean value whether p is a file path or not.
 */
export function isDirectorySync(p: string | null): boolean {
  if (p == null) return false
  if (!fs.existsSync(p)) return false
  const stat = fs.statSync(p)
  return stat.isDirectory()
}


/**
 * Check if p is a non-existent path or empty folder. (synchronizing)
 *
 * @param p   directory path
 * @return a boolean value whether p a non-existent path or empty folder
 */
export function isNonExistentOrEmpty(p: string | null): boolean {
  if (p == null) return false
  if (!fs.existsSync(p)) return true
  const stat = fs.statSync(p)
  if (!stat.isDirectory()) return false
  const files: string[] = fs.readdirSync(p)
  return files.length <= 0
}


/**
 * ensure p is a valid file path.
 *
 * @param p
 * @param message
 */
export async function ensureFilePath(p: string | null): Promise<void | never> {
  if (p == null) {
    logger.error('invalid path: null.')
    process.exit(-1)
  }
  if (!fs.existsSync(p!)) {
    logger.error(`${ p } is not found.`)
    process.exit(-1)
  }
  if (await isFile(p)) return
  logger.error(`${ p } is not a file.`)
  process.exit(-1)
}


/**
 * ensure p is a valid file path. (synchronizing)
 *
 * @param p
 * @param message
 */
export function ensureFilePathSync(p: string | null): void | never {
  if (p == null) {
    logger.error('invalid path: null.')
    process.exit(-1)
  }
  if (!fs.existsSync(p!)) {
    logger.error(`${ p } is not found.`)
    process.exit(-1)
  }
  if (isFileSync(p)) return
  logger.error(`${ p } is not a file.`)
  process.exit(-1)
}
