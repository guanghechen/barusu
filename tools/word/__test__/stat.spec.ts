import fs from 'fs-extra'
import path from 'path'
import { performCharacterStatistics, calcCharacterStat } from '../src'
import globby from 'globby'


/**
 * load content from absoluteFilepath
 * @param absoluteFilepath
 */
export async function loadContent(absoluteFilepath: string): Promise<string> {
  const content: string = await fs.readFile(absoluteFilepath, 'utf-8')
  return content
}


describe('stat characters', function () {
  const rootDir = path.resolve(__dirname, 'cases/files')
  const filenames = globby.sync('*', {
    cwd: rootDir,
    onlyFiles: true,
    expandDirectories: false,
  })
  const filepaths: string[] = filenames.map(p => path.resolve(rootDir, p)).sort()
  console.log('filepath:', filepaths)

  for (const filepath of filepaths) {
    const { name } = path.parse(filepath)
    test(name, async function () {
      const content: string = await loadContent(filepath)
      const detailMap = performCharacterStatistics(content)

      expect(calcCharacterStat(detailMap, 10, false)).toMatchSnapshot()
      expect(calcCharacterStat(detailMap, 10, true)).toMatchSnapshot()
    })
  }
})
