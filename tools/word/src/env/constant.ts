import path from 'path'
export {
  name as packageName,
  version as packageVersion,
} from '@barusu/tool-word/package.json'

// Command name
export const COMMAND_NAME = 'barusu-word'

// Config files root dir
export const configRootDir = path.resolve(__dirname, '../config')

// Template files root dir
export const templateRootDir = path.join(configRootDir, 'templates')
