import { ColorfulChalkLogger, INFO } from '@barusu/chalk-logger'


export const COMMAND_NAME = 'barusu-cipher'


export const logger = new ColorfulChalkLogger(COMMAND_NAME, {
  level: INFO,
  date: true,
}, process.argv)
