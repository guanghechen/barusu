import { expect } from 'chai'
import { before, it } from 'mocha'
import fs from 'fs-extra'
import path from 'path'
import { compareModulePath, defaultModuleRankItems } from '../src/util'


it('This is a required placeholder to allow before() to work', () => { })
before(async function test() {
  const caseRootDir = path.resolve(__dirname, 'cases')
  const testFileNames: string[] = [
    'module-compare.input.json',
  ]

  const logKase = (kase: any) => kase.input.p1 + '\n      ' + kase.input.p2

  for (const fileName of testFileNames) {
    const p = path.resolve(caseRootDir, fileName)
    const data = fs.readJSONSync(p)
    describe(data.title, function () {
      for (const kase of data.cases) {
        const { input, answer } = kase
        const output = compareModulePath(input.p1, input.p2, [
          {
            regex: /^(react|vue|angular)(?:\-[\w\-.]*)?$/,
            rank: 0.1,
          },
          ...defaultModuleRankItems,
        ])

        it(kase.title, function () {
          if (answer === undefined) {
            expect(output, logKase(kase)).to.be.null
            return
          }
          expect(output, logKase(kase)).not.to.be.null
          expect(output, logKase(kase)).to.equal(answer)
        })
      }
    })
  }
})
