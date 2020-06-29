import { ColorfulChalkLogger, Level } from 'colorful-chalk-logger'


/**
 * command name
 */
const COMMAND_NAME = 'rapit'


const loggerOptions = {
  colorful: true,
  inline: true,
  date: true,
}


export const logger: ColorfulChalkLogger = new ColorfulChalkLogger(COMMAND_NAME, loggerOptions, process.argv)


/**
 * 更新日志打印级别
 * @param levelName
 */
export function updateLogLevel (levelName: string) {
  const level = Level.valueOf(levelName)
  if (level == null) return
  logger.setLevel(level)
}


/**
 * 更新日志名称
 * @param logName
 */
export function updateLogName (logName: string) {
  if (logName == null) return
  logger.setName(COMMAND_NAME + ' ' + logName)
}
