import path from 'path'

// eslint-disable-next-line import/no-extraneous-dependencies
export {
  name as packageName,
  version as packageVersion,
} from '@barusu/tool-restful-api/package.json'

// Command name
export const COMMAND_NAME = 'barusu-rapit'

// Config files root dir
export const configRootDir = path.resolve(__dirname, '../config')

// Template files root dir
export const templateRootDir = path.join(configRootDir, 'templates')
