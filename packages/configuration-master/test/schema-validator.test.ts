import path from 'path'
import { DataValidatorTestCaseMaster } from './util/schema-validator-case-util'


it('This is a required placeholder to allow before() to work', () => { })


// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
before(async function test() {
  const caseRootDirectory = path.resolve('test/cases')
  const caseMaster = new DataValidatorTestCaseMaster({ caseRootDirectory })
  await caseMaster.scan(path.join(caseRootDirectory, 'data-schema'))

  describe('DataValidator test cases', function () {
    caseMaster.test()
  })
})
