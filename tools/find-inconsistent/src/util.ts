import { ColorfulChalkLogger, INFO } from '@barusu/chalk-logger'


export const COMMAND_NAME = 'barusu-find-inconsistent'


export const logger = new ColorfulChalkLogger(COMMAND_NAME, {
  level: INFO,
  date: true,
}, process.argv)


export const checkFatalError = (hasError: boolean): never | void => {
  if (hasError) process.exit(-1)
}
