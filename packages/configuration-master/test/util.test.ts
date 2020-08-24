import { expect } from 'chai'
import fs from 'fs-extra'
import path from 'path'
import { toKebabCase } from '@barusu/util-option'


/**
 * 测试案例
 */
interface CaseItem {
  /**
   * 测试案例标题
   */
  title: string
  /**
   * 输入文件
   */
  inputDataFilePath: string
  /**
   * 答案文件
   */
  answerDataFilePath: string
}


it('This is a required placeholder to allow before() to work', () => { })


// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
before(async function () {
  const scanDir = async function (rootDir: string, p: string): Promise<CaseItem[]> {
    const files = await fs.readdir(p)
    const items: CaseItem[] = []
    for (const f of files) {
      const abf = path.join(p, f)
      const stat = fs.statSync(abf)
      if (stat.isDirectory()) {
        const _items = await scanDir(rootDir, abf)
        items.push(..._items)
        continue
      }
      if (/inputs\.json$/.test(f)) {
        const prefix = f.substr(0, f.length - 11)
        const answerFilepath = prefix + 'answers.json'
        const item: CaseItem = {
          title: path.relative(rootDir, p) + ' ' + prefix,
          inputDataFilePath: abf,
          answerDataFilePath: path.join(p, answerFilepath)
        }
        items.push(item)
        continue
      }
    }
    return items
  }

  const caseRootDir = path.resolve('test/cases')
  const test = async function (title: string, caseDir: string, func: (x: any) => any) {
    const cases: CaseItem[] = await scanDir(caseRootDir, caseDir)
    describe(title, function() {
      for (const kase of cases) {
        it(kase.title, async function () {
          const inputs: any[] = await fs.readJSONSync(kase.inputDataFilePath)
          const answers: any[] = await fs.readJSONSync(kase.answerDataFilePath)
          const outputs: any[] = inputs.map(input => func(input))

          // 输出和答案应有相同的数据数
          expect(outputs)
            .to.be.an('array')
            .to.have.lengthOf(answers.length)

          // check data
          expect(outputs).to.deep.equal(answers)
        })
      }
    })
  }

  // test _util/string-util
  test('_util/string-util', path.join(caseRootDir, '_util/string-util'), toKebabCase)
})
