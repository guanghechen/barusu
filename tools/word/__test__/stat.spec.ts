import fs from 'fs-extra'
import path from 'path'
import { performCharacterStatistics, calcCharacterStat } from '../src'


/**
 * load content from filepath
 * @param filepath
 */
export async function loadContent(filepath: string): Promise<string> {
  const absoluteFilepath = path.resolve(__dirname, 'cases', filepath)
  const content: string = await fs.readFile(absoluteFilepath, 'utf-8')
  return content
}


test('rumengling', async function () {
  const content: string = await loadContent('rumengling.md')
  const detailMap = performCharacterStatistics(content)
  const stat = calcCharacterStat(detailMap, 10)
  expect(stat).toMatchSnapshot()
})
