import path from 'path'
export { name, version } from '@barusu/tool-git-cipher/package.json'


// Command name
export const COMMAND_NAME = 'barusu-git-cipher'


// Config root dir
export const configRootDir = path.resolve(__dirname, '../config')
export const templateRootDir = path.join(configRootDir, 'templates')


/**
 * Calc absolute path of configs
 * @param filepath
 */
export function resolveConfigFilepath(...filepath: string[]): string {
  return path.resolve(configRootDir, ...filepath)
}


/**
 * Calc absolute path of template files
 * @param filepath
 */
export function resolveTemplateFilepath(...filepath: string[]): string {
  return path.resolve(templateRootDir, ...filepath)
}
