import fs from 'fs-extra'
import globby from 'globby'
import path from 'path'
import {
  calcCharacterStat,
  formatCharacterStat,
  performCharacterStatistics,
} from '../src'

/**
 * load content from absoluteFilepath
 * @param absoluteFilepath
 */
async function loadContent(absoluteFilepath: string): Promise<string> {
  const content: string = await fs.readFile(absoluteFilepath, 'utf-8')
  return content
}

describe('util', function () {
  const rootDir = path.resolve(__dirname, 'cases/files')
  const filenames = globby.sync('*', {
    cwd: rootDir,
    onlyFiles: true,
    expandDirectories: false,
  })
  const filepaths: string[] = filenames
    .map(p => path.resolve(rootDir, p))
    .sort()

  describe('calcCharacterStat', function () {
    for (const filepath of filepaths) {
      const { name } = path.parse(filepath)
      // eslint-disable-next-line jest/valid-title
      test(name, async function () {
        const content: string = await loadContent(filepath)
        const detailMap = performCharacterStatistics(content)

        expect(calcCharacterStat(detailMap, 10, false)).toMatchSnapshot()
        expect(calcCharacterStat(detailMap, 10, true)).toMatchSnapshot()
      })
    }
  })

  describe('formatCharacterStat', function () {
    for (const filepath of filepaths) {
      const { name } = path.parse(filepath)
      // eslint-disable-next-line jest/valid-title
      test(name, async function () {
        const content: string = await loadContent(filepath)
        const detailMap = performCharacterStatistics(content)

        expect(
          formatCharacterStat(calcCharacterStat(detailMap, 10, false)),
        ).toMatchSnapshot()
        expect(
          formatCharacterStat(calcCharacterStat(detailMap, 10, true)),
        ).toMatchSnapshot()
      })
    }
  })
})
