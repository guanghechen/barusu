import { expect } from 'chai'
import { describe, it } from 'mocha'
import { convertToBoolean, convertToNumber, convertToString } from '../src'


describe('convert', function () {
  describe('convertToBoolean', function () {
    it('`true` ==> true', () =>
      expect(convertToBoolean(true)).to.equal(true))
    it('`false` ==> false', () =>
      expect(convertToBoolean(false)).to.equal(false))
    it('`\'True\'` ==> true', () =>
      expect(convertToBoolean('True')).to.equal(true))
    it('`\'FaLSe\'` ==> false', () =>
      expect(convertToBoolean('FaLSe')).to.equal(false))
    it('`undefined` ==> undefined', () =>
      expect(convertToBoolean(undefined)).to.be.undefined)
    it('`null` ==> undefined', () =>
      expect(convertToBoolean(null)).to.be.undefined)
    it('`0` ==> false', () =>
      expect(convertToBoolean(0)).to.equal(false))
    it('`1` ==> true', () =>
      expect(convertToBoolean(1)).to.equal(true))
    it('`[]` ==> true', () =>
      expect(convertToBoolean([])).to.equal(true))
    it('`{}` ==> true', () =>
      expect(convertToBoolean({})).to.equal(true))
    it('`\'\'` ==> undefined', () =>
      expect(convertToBoolean('')).to.be.undefined)
  })

  describe('convertToNumber', function () {
    it('`0` ==> 0', () =>
      expect(convertToNumber(0)).to.equal(0))
    it('`1` ==> 1', () =>
      expect(convertToNumber(1)).to.equal(1))
    it('`\'0\'` ==> 0', () =>
      expect(convertToNumber('0')).to.equal(0))
    it('`\'1\'` ==> 1', () =>
      expect(convertToNumber('1')).to.equal(1))
    it('`\'-1\'` ==> -1', () =>
      expect(convertToNumber('-1')).to.equal(-1))
    it('`true` ==> undefined', () =>
      expect(convertToNumber(true)).to.be.undefined)
    it('`false` ==> undefined', () =>
      expect(convertToNumber(false)).to.be.undefined)
    it('`undefined` ==> undefined', () =>
      expect(convertToNumber(undefined)).to.be.undefined)
    it('`null` ==> undefined', () =>
      expect(convertToNumber(null)).to.be.undefined)
    it('`[]` ==> undefined', () =>
      expect(convertToNumber([])).to.be.undefined)
    it('`{}` ==> undefined', () =>
      expect(convertToNumber({})).to.be.undefined)
    it('`\'\'` ==> undefined', () =>
      expect(convertToNumber('')).to.be.undefined)
  })

  describe('convertToString', function () {
    it('`\'\'` ==> \'\'', () =>
      expect(convertToString('')).to.equal(''))
    it('`-1` ==> \'-1\'', () =>
      expect(convertToString(-1)).to.equal('-1'))
    it('`true` ==> \'true\'', () =>
      expect(convertToString(true)).to.equal('true'))
    it('`false` ==> \'false\'', () =>
      expect(convertToString(false)).to.equal('false'))
    it('`undefined` ==> undefined', () =>
      expect(convertToString(undefined)).to.be.undefined)
    it('`null` ==> undefined', () =>
      expect(convertToString(null)).to.be.undefined)
    it('`[]` ==> undefined', () =>
      expect(convertToString([])).to.be.undefined)
    it('`{}` ==> undefined', () =>
      expect(convertToString({})).to.be.undefined)
  })
})
