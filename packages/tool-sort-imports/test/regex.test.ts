import fs from 'fs-extra'
import path from 'path'
import { it, before } from 'mocha'
import { expect } from 'chai'
import { createStaticImportOrExportRegex } from '../src/util'


it('This is a required placeholder to allow before() to work', () => { })
before(async function test() {
  const caseRootDir = path.resolve(__dirname, 'cases')
  const testFileNames: string[] = [
    'regex.input.json',
  ]

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
          expect(output).not.to.be.null
          expect(output!.groups).not.to.be.undefined
          expect(removeUndefined(output!.groups!)).to.deep.equal(answer)
        })
      }
    })
  }
})

