import path from 'path'
import { configurationMaster } from '../src'
import {
  DataSchemaCompilerTestCaseMaster,
} from './util/schema-compiler-case-util'


it('This is a required placeholder to allow before() to work', () => { })


// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
before(async function test() {
  const caseRootDirectory = path.resolve('test/cases')
  const caseMaster = new DataSchemaCompilerTestCaseMaster(configurationMaster, { caseRootDirectory })
  await caseMaster.scan(path.join(caseRootDirectory, 'data-schema'))

  describe('DataSchemaCompiler test cases', function () {
    caseMaster.test()
  })
})
