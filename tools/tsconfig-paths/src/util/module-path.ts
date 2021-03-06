const esStaticImportOrExportRegexList: RegExp[] = createStaticImportRegexList(
  '',
)
const esStaticImportOrExportPatternList: RegExp[] = createStaticImportRegexList(
  'g',
)

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
    result = result.replace(pattern, rawString => {
      const m = regex.exec(rawString)!
      const { quote, moduleName } = m.groups!
      const p: string = transform(moduleName)
      return rawString.replace(quote + moduleName + quote, quote + p + quote)
    })
  }
  return result
}

export function createStaticImportRegexList(flags: string): RegExp[] {
  const optionalSpacesRegex = /\s*/
  const requiredSpacesRegex = /\s+/
  const remainOfLineRegex = /(?<remainOfLine>[^\n]*)/
  const fromRegex = /(?:(?<keywordFrom>from)\s+)/
  const moduleNameRegex = /(?:(?<quote>['"])(?<moduleName>[^'"]+)\k<quote>(?:\s*;+)?)/
  const typeRegex = /(?:\b(?<type>import|export))/
  const importTypeRegex = /(?:\b(?<type>import))/
  const exportTypeRegex = /(?:\b(?<type>export))/
  const importDefaultRegex = /(?:(?<defaultExport>(?:\w+\s*,\s*)?(?:\w+|\w\s+as\s+\w+|\*\s*as\s+\w+)))/
  const exportDefaultRegex = /(?:(?<defaultExport>(?:\*|\*\s*as\s+\w+)))/
  const importOrExportNRegex = /(?:(?<keywordType>type)?\s*?\{\s*(?<exportN>(?:[\w]+(?:\s+as\s+[\w]+)?\s*,\s*)*[\w]+(?:\s+as\s+[\w]+)?(?:\s*,)?)\s*?\})/

  const regexList = [
    /**
     * Import only
     *
     *  ```typescript
     *  import 'module'
     *  import 'module';
     *  ```
     */
    new RegExp(
      importTypeRegex.source +
        optionalSpacesRegex.source +
        moduleNameRegex.source +
        remainOfLineRegex.source,
      flags,
    ),
    /**
     * Import default
     *
     *  ```typescript
     *  import a from 'module'
     *  import a as b from 'module'
     *  import * as b from 'module'
     *  import a, * as b from 'module'
     *  ```
     */
    new RegExp(
      importTypeRegex.source +
        requiredSpacesRegex.source +
        importDefaultRegex.source +
        requiredSpacesRegex.source +
        fromRegex.source +
        moduleNameRegex.source +
        remainOfLineRegex.source,
      flags,
    ),
    /**
     * Export default
     *
     *  ```typescript
     *  export * as b from 'module'
     *  export * from 'module'
     *  ```
     */
    new RegExp(
      exportTypeRegex.source +
        optionalSpacesRegex.source +
        exportDefaultRegex.source +
        requiredSpacesRegex.source +
        fromRegex.source +
        moduleNameRegex.source +
        remainOfLineRegex.source,
      flags,
    ),
    /**
     * ImportN
     *
     *  ```typescript
     *  import { a as b, c, d as e } from 'module'
     *  import type { Logger } from '@barusu/chalk-logger'
     *  export { a as b, c, d as e } from 'module'
     *  export type { Logger } from '@barusu/chalk-logger'
     *  ```
     */
    new RegExp(
      typeRegex.source +
        optionalSpacesRegex.source +
        importOrExportNRegex.source +
        optionalSpacesRegex.source +
        fromRegex.source +
        moduleNameRegex.source +
        remainOfLineRegex.source,
      flags,
    ),
    /**
     * Import default + ImportN
     *  ```typescript
     *  import x, { a as b, c, d as e } from 'module'
     *  import a as b, type { Logger } from '@barusu/chalk-logger'
     *  import * as e, type { Logger } from '@barusu/chalk-logger'
     *  ```
     */
    new RegExp(
      importTypeRegex.source +
        optionalSpacesRegex.source +
        importDefaultRegex.source +
        /(?:\s*,\s*)/.source +
        importOrExportNRegex.source +
        optionalSpacesRegex.source +
        fromRegex.source +
        moduleNameRegex.source +
        remainOfLineRegex.source,
      flags,
    ),
  ]

  return regexList
}
