import { createStaticImportOrExportRegexList } from '@barusu/tool-sort-imports'
import { CommandConfigurationOptions } from '@barusu/util-cli'


const esStaticImportOrExportRegexList: RegExp[] = createStaticImportOrExportRegexList('')
const esStaticImportOrExportPatternList: RegExp[]  = createStaticImportOrExportRegexList('g')


/**
 *
 * @param input
 * @param transform
 */
export function correctModulePath(
  input: string,
  transform: (modulePath: string) => string,
): string {
  let result = input
  for (let i = 0; i < esStaticImportOrExportRegexList.length; ++i) {
    const regex = esStaticImportOrExportRegexList[i]
    const pattern = esStaticImportOrExportPatternList[i]
    result = input.replace(pattern, (rawString) => {
      const m = regex.exec(rawString)!
      const { quote, moduleName } = m.groups!
      const p: string = transform(moduleName)
      return rawString.replace(quote + moduleName + quote, quote + p + quote)
    })
  }
  return result
}


/**
 *
 */
export interface CommandOptions extends CommandConfigurationOptions {
  /**
   * log level
   * @default undefined
   */
  logLevel?: 'debug' | 'verbose' | 'info' | 'warn' | 'error' | string
}


export const defaultCommandOptions: CommandOptions = {
  logLevel: undefined,
}
