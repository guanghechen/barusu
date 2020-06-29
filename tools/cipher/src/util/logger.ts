import { ColorfulChalkLogger, INFO } from '@barusu/chalk-logger'


export const logger = new ColorfulChalkLogger('barusu-cipher', {
  level: INFO,
  date: true,
}, process.argv)
