import chalk from 'chalk'


export const logger = {
  verb: (...messages: string[]) => console.info(chalk.cyan(messages.join(' '))),
  info: (...messages: string[]) => console.info(chalk.green(messages.join(' '))),
  warn: (...messages: string[]) => console.info(chalk.yellow(messages.join(' '))),
  error: (...messages: string[]) => console.error(chalk.red(messages.join(' '))),
}


export const checkFatalError = (hasError: boolean): never | void => {
  if (hasError) process.exit(-1)
}
