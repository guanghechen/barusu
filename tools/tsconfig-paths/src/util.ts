import { createStaticImportOrExportRegex } from '@barusu/tool-sort-imports'
import { CommandConfigurationOptions } from '@barusu/util-cli'


const esStaticImportOrExportRegex = createStaticImportOrExportRegex()
const esStaticImportOrExportPattern = createStaticImportOrExportRegex('g')


/**
 *
 * @param input
 * @param transform
 */
export function correctModulePath(
  input: string,
  transform: (modulePath: string) => string,
): string {
  const result = input
    .replace(esStaticImportOrExportPattern, (rawString) => {
      const m = esStaticImportOrExportRegex.exec(rawString)!
      const { quote, moduleName } = m.groups!
      const p: string = transform(moduleName)
      return rawString.replace(quote + moduleName + quote, quote + p + quote)
    })
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
