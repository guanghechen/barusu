import { ColorfulChalkLogger, INFO } from '@barusu/chalk-logger'
import { COMMAND_NAME } from '../env/constant'


export const logger = new ColorfulChalkLogger(COMMAND_NAME, {
  level: INFO,
  date:  true,
}, process.argv)
