import { assert } from 'chai'
import { exec, getDefaultArgs } from '../src'

describe('error', () => {
  it('error-check', async () => {
    try {
      await exec('__test__/fixtures/dates/', 'MyObject', getDefaultArgs())
      assert.fail('Expected exec to fail')
    } catch (err) {
      assert.instanceOf(err, Error)
      assert.equal(
        err.message,
        'No output definition. Probably caused by errors prior to this?',
      )
    }
  })
})
