import { expect } from 'chai'
import { coverBoolean, coverNumber, coverString } from '../src'


describe('cover', function () {
  describe('coverBoolean', function () {
    it('(true, undefined) => true', () =>
      expect(coverBoolean(true, undefined)).to.equal(true))
    it('(true, null) => true', () =>
      expect(coverBoolean(true, null)).to.equal(true))
    it('(true, 0) => false', () =>
      expect(coverBoolean(true, 0)).to.equal(false))
    it('(false) => true', () =>
      expect(coverBoolean(false)).to.equal(false))
    it('(false, []) => true', () =>
      expect(coverBoolean(false, [])).to.equal(true))
    it('(false, {}) => true', () =>
      expect(coverBoolean(false, {})).to.equal(true))
    it('(false, true) => true', () =>
      expect(coverBoolean(false, true)).to.equal(true))
    it('(false, \'true\') => true', () =>
      expect(coverBoolean(false, 'true')).to.equal(true))
    it('(true, \'FaLse\') => false', () =>
      expect(coverBoolean(false, 'FaLse')).to.equal(false))
  })

  describe('coverNumber', function () {
    it('(3, undefined) => 3', () =>
      expect(coverNumber(3, undefined)).to.equal(3))
    it('(3, null) => 3', () =>
      expect(coverNumber(3, null)).to.equal(3))
    it('(3, 0) => 0', () =>
      expect(coverNumber(3, 0)).to.equal(0))
    it('(3, true) => 3', () =>
      expect(coverNumber(3, true)).to.equal(3))
    it('(3, false) => 3', () =>
      expect(coverNumber(3, false)).to.equal(3))
    it('(3, []) => 3', () =>
      expect(coverNumber(3, [])).to.equal(3))
    it('(3, {}) => 3', () =>
      expect(coverNumber(3, {})).to.equal(3))
    it('(3, \'5\') => 5', () =>
      expect(coverNumber(3, '5')).to.equal(5))
    it('(3, \'\') => 3', () =>
      expect(coverNumber(3, '')).to.equal(3))
  })

  describe('coverString', function () {
    it('(\'x\', undefined) => \'x\'', () =>
      expect(coverString('x', undefined)).to.equal('x'))
    it('(\'x\', null) => \'x\'', () =>
      expect(coverString('x', null)).to.equal('x'))
    it('(\'x\', \'y\') => \'y\'', () =>
      expect(coverString('x', 'y')).to.equal('y'))
    it('(\'x\', 0) => \'0\'', () =>
      expect(coverString('x', 0)).to.equal('0'))
    it('(\'x\', []) => \'x\'', () =>
      expect(coverString('x', [])).to.equal('x'))
    it('(\'x\', {}) => \'x\'', () =>
      expect(coverString('x', {})).to.equal('x'))
    it('(\'x\', true) => \'x\'', () =>
      expect(coverString('x', true)).to.equal('true'))
    it('(\'x\', false) => \'x\'', () =>
      expect(coverString('x', false)).to.equal('false'))
  })
})
