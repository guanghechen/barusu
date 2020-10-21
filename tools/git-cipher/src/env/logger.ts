import ChalkLogger from '@barusu/chalk-logger'
import { COMMAND_NAME } from './constant'


export const logger = new ChalkLogger(
  COMMAND_NAME,
  {
    date: true,
  },
  process.argv
)
