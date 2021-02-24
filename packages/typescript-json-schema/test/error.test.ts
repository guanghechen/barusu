import { assert } from 'chai'
import { exec, getDefaultArgs } from '../src'

describe('error', () => {
  it('error-check', () => {
    assert.throws(
      () => {
        // This needs a valid path. "dates" chosen basically at random
        exec('test/programs/dates/', 'MyObject', getDefaultArgs())
      },
      Error,
      'No output definition. Probably caused by errors prior to this?',
    )
  })
})
