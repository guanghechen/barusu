import { assert } from 'chai'
import fs from 'fs-extra'
import { exec, getDefaultArgs } from '../src'

describe('out option', () => {
  beforeEach(() =>
    fs.rmSync('./dist/test/doesnotexist', { recursive: true, force: true }),
  )
  it('should create parent directory when necessary', async () => {
    try {
      await exec('__test__/fixtures/interface-single/main.ts', 'MyObject', {
        ...getDefaultArgs(),
        out: './dist/test/doesnotexist/schema.json',
      })
    } catch (err) {
      assert.fail(`Execution should not have failed: ${err.stack}`)
    }
  })
})
