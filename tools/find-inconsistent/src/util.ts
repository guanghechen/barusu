export const checkFatalError = (hasError: boolean): never | void => {
  if (hasError) process.exit(-1)
}
