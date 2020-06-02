import { expect } from 'chai'
import { before, it } from 'mocha'
import fs from 'fs-extra'
import path from 'path'
import { createStaticImportOrExportRegex } from '../src/util'


it('This is a required placeholder to allow before() to work', () => { })
before(async function test() {
  const caseRootDir = path.resolve(__dirname, 'cases')
  const testFileNames: string[] = [
    'regex.input.json',
  ]

  const logKase = (kase: any) => kase.input

  const regex = createStaticImportOrExportRegex()
  const removeUndefined = (o: object) => JSON.parse(JSON.stringify(o))
  for (const fileName of testFileNames) {
    const p = path.resolve(caseRootDir, fileName)
    const data = fs.readJSONSync(p)
    describe(data.title, function () {
      for (const kase of data.cases) {
        const { input, answer } = kase
        const output = regex.exec(input)

        it(kase.title, function () {
          if (answer === undefined) {
            expect(output).to.be.null
            return
          }
          expect(output, logKase(kase)).not.to.be.null
          expect(output!.groups, logKase(kase)).not.to.be.undefined
          expect(removeUndefined(output!.groups!), logKase(kase)).to.deep.equal(answer)
        })
      }
    })
  }
})
