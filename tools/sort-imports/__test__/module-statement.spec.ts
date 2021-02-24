import path from 'path'
import { runCaseTree } from '@barusu/util-jest'
import {
  createStaticImportOrExportRegexList,
  execWithMultipleRegex,
  extractStaticModuleStatementItem,
  formatStaticModuleStatementItem,
} from '../src'

const regexList = createStaticImportOrExportRegexList('g')
const exec = (
  content: string,
): { lastIndex: number; groups: Record<string, string> } | null => {
  const result = execWithMultipleRegex(regexList, content)
  if (result == null) return null

  return {
    lastIndex: result.regex.lastIndex,
    groups: result.result.groups!,
  }
}

const caseDir = path.resolve(__dirname, 'cases')
runCaseTree(path.resolve(caseDir, 'module-statement.json'), kase => {
  const result = exec(kase.input as string)
  expect({ input: kase.input as string, result }).toMatchSnapshot(
    'execWithMultipleRegex',
  )

  if (result == null) return

  const statementItem = extractStaticModuleStatementItem(result!.groups!)
  expect(statementItem).toMatchSnapshot('extractStaticModuleStatementItem')

  const quote = "'"
  for (const semicolon of [false, true]) {
    for (const indent of ['  ', '\t']) {
      const snapshotName = `formatStaticModuleStatementItem:semicolon(${semicolon}):indent(${indent})`
      const formattedString: string = formatStaticModuleStatementItem(
        statementItem,
        quote,
        indent,
        semicolon,
        80,
      )
      expect(formattedString).toMatchSnapshot(snapshotName)
    }
  }
})
