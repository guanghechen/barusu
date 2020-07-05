import fs from 'fs-extra'
import yaml from 'js-yaml'
import path from 'path'
import { Logger } from './types'


/**
 * Check whether if the filepath is a file path.
 *
 * @param filepath   file path
 */
export async function isFile(filepath: string | null): Promise<boolean> {
  if (filepath == null) return false
  if (!fs.existsSync(filepath)) return false
  const stat = await fs.stat(filepath)
  return stat.isFile()
}


/**
 * Check whether if the filepath is a file path. (synchronizing)
 *
 * @param filepath   file path
 */
export function isFileSync(filepath: string | null): boolean {
  if (filepath == null) return false
  if (!fs.existsSync(filepath)) return false
  const stat = fs.statSync(filepath)
  return stat.isFile()
}


/**
 * Check whether if the dirpath is a directory path. (synchronizing)
 *
 * @param dirpath   directory path
 */
export function isDirectorySync(dirpath: string | null): boolean {
  if (dirpath == null) return false
  if (!fs.existsSync(dirpath)) return false
  const stat = fs.statSync(dirpath)
  return stat.isDirectory()
}


/**
 * Check whether if the dirPath is a non-existent path or empty folder. (synchronizing)
 *
 * @param dirpath   directory path
 */
export function isNonExistentOrEmpty(dirpath: string | null): boolean {
  if (dirpath == null) return false
  if (!fs.existsSync(dirpath)) return true
  const stat = fs.statSync(dirpath)
  if (!stat.isDirectory()) return false
  const files: string[] = fs.readdirSync(dirpath)
  return files.length <= 0
}


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


/**
 * Ensure critical filepath exists, otherwise, kill the process
 *
 * @param filepath
 * @param logger
 */
export async function ensureCriticalFilepathExists(
  filepath: string | null,
  logger?: Logger
): Promise<void | never> {
  let errMsg: string | null = null

  if (filepath == null) {
    errMsg = 'invalid path: null.'
  } else if (!fs.existsSync(filepath!)) {
    errMsg = `${ filepath } is not found.`
  } else if (!(await isFile(filepath))) {
    errMsg = `${ filepath } is not a file.`
  }

  // print error and kill process
  if (errMsg != null && logger != null && logger.error != null) {
    logger.error(errMsg)
    process.exit(-1)
  }
}


/**
 * Ensure critical filepath exists, otherwise, kill the process (synchronizing)
 *
 * @param filepath
 * @param logger
 */
export function ensureCriticalFilepathExistsSync(
  filepath: string | null,
  logger?: Logger
): void | never {
  let errMsg: string | null = null

  if (filepath == null) {
    errMsg = 'invalid path: null.'
  } else if (!fs.existsSync(filepath!)) {
    errMsg = `${ filepath } is not found.`
  } else if (!(isFileSync(filepath))) {
    errMsg = `${ filepath } is not a file.`
  }

  // print error and kill process
  if (errMsg != null && logger != null && logger.error != null) {
    logger.error(errMsg)
    process.exit(-1)
  }
}


/**
 * Load configuration file with format .json / .yml / .yaml
 *
 * @param filepath
 * @param logger
 */
export async function loadJsonOrYaml(filepath: string, encoding = 'utf-8'): Promise<unknown | never> {
  const extname = path.extname(filepath)

  let __content: string | null = null
  const loadContent = async (): Promise<string> => {
    if (__content != null) return __content
    if (!(await isFile(filepath))) {
      throw new Error(`${ filepath } is an invalid file path`)
    }
    __content = fs.readFileSync(filepath, encoding)
    return __content
  }

  let result: unknown
  switch (extname) {
    case '.json':
      {
        const content: string = await loadContent()
        result = JSON.parse(content)
      }
      break
    case '.yml':
    case '.yaml':
      {
        const content: string = await loadContent()
        result = yaml.safeLoad(content, { filename: filepath, json: true })
      }
      break
    default:
      throw new Error(`Only files in .json / .yml / .ymal format are supported. filepath(${ filepath }`)
  }
  return result
}



/**
 * Load configuration file with format .json / .yml / .yaml  (synchronizing)
 *
 * @param filepath
 * @param logger
 */
export function loadJsonOrYamlSync(filepath: string, encoding = 'utf-8'): unknown | never {
  const extname = path.extname(filepath)

  let __content: string | null = null
  const loadContent = (): string => {
    if (__content != null) return __content
    if (!isFileSync(filepath)) {
      throw new Error(`${ filepath } is an invalid file path`)
    }
    __content = fs.readFileSync(filepath, encoding)
    return __content
  }

  let result: unknown
  switch (extname) {
    case '.json':
      {
        const content: string = loadContent()
        result = JSON.parse(content)
      }
      break
    case '.yml':
    case '.yaml':
      {
        const content: string = loadContent()
        result = yaml.safeLoad(content, { filename: filepath, json: true })
      }
      break
    default:
      throw new Error(`Only files in .json / .yml / .ymal format are supported. filepath(${ filepath }`)
  }
  return result
}
