import { ColorfulChalkLogger, INFO } from '@barusu/chalk-logger'
import { createStaticImportOrExportRegex } from '@barusu/tool-sort-imports'


export const logger = new ColorfulChalkLogger('resolve-tsconfig-paths', {
  level: INFO,
  date: true,
}, process.argv)



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
