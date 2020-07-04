import { ColorfulChalkLogger, INFO } from '@barusu/chalk-logger'


export const logger = new ColorfulChalkLogger('find-inconsistent', {
  level: INFO,
  date: true,
}, process.argv)


export const checkFatalError = (hasError: boolean): never | void => {
  if (hasError) process.exit(-1)
}
