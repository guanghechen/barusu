import fs from 'fs-extra'
import path from 'path'
import type { ResolvedApiItemGroup } from '../src'
import { ApiItemParser } from '../src'

// override
function formatApiItemGroup(data: ResolvedApiItemGroup[]): any {
  const projectDir = path.resolve()
  const stringifyFilter = (key: string, value: any): unknown => {
    // RegExp to string
    if (value instanceof RegExp) {
      return value.source
    }

    // replace absolute path with symbol
    if (typeof value === 'string') {
      if (value.startsWith(projectDir)) {
        return '<PROJECT_DIR>' + value.substr(projectDir.length)
      }
    }

    return value
  }
  return JSON.parse(JSON.stringify(data, stringifyFilter))
}

describe('api-parser', function () {
  const caseRootDirectory = path.resolve(__dirname, 'cases', 'api-parser')
  const kases = fs.readdirSync(caseRootDirectory)

  const parser = new ApiItemParser()
  for (const apiConfigFilePath of kases) {
    const title = path.parse(apiConfigFilePath).name
    // eslint-disable-next-line jest/valid-title
    test(title, async function () {
      const apiConfigFilepath = path.resolve(
        caseRootDirectory,
        apiConfigFilePath,
      )
      parser.scan(apiConfigFilepath, 'utf-8')
      const apiItemGroups = parser.collect()
      const data = formatApiItemGroup(apiItemGroups)
      expect(data).toMatchSnapshot('api items')
    })
  }
})
