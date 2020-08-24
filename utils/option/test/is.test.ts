import { expect } from 'chai'
import {
  isArray,
  isBigint,
  isBoolean,
  isEmptyObject,
  isFunction,
  isInteger,
  isNotEmptyArray,
  isNotEmptyObject,
  isNotEmptyString,
  isNumber,
  isNumberLike,
  isObject,
  isPrimitiveBoolean,
  isPrimitiveInteger,
  isPrimitiveNumber,
  isPrimitiveString,
  isString,
  isSymbol,
  isUndefined,
} from '../src'


describe('is', function () {
  describe('isUndefined', function () {
    it('`undefined` is undefined', () =>
      expect(isUndefined(undefined)).to.be.true)
    it('`null` is not undefined', () =>
      expect(isUndefined(null)).to.be.false)
    it('`false` is not undefined', () =>
      expect(isUndefined(false)).to.be.false)
    it('`0` is not undefined', () =>
      expect(isUndefined(0)).to.be.false)
    it('empty string is not undefined', () =>
      expect(isUndefined('')).to.be.false)
    it('empty array is not undefined', () =>
      expect(isUndefined([])).to.be.false)
    it('empty object is not undefined', () =>
      expect(isUndefined({})).to.be.false)
  })

  describe('isBoolean', function () {
    it('`false` is a boolean type', () =>
      expect(isBoolean(false)).to.be.true)
    it('`true` is a boolean type', () =>
      expect(isBoolean(true)).to.be.true)
    it('`new Boolean(undefined)` is a boolean type', () =>
      expect(isBoolean(new Boolean(undefined))).to.be.true)
    it('`new Boolean(null)` is a boolean type', () =>
      expect(isBoolean(new Boolean(null))).to.be.true)
    it('`new Boolean(1)` is a boolean type', () =>
      expect(isBoolean(new Boolean(1))).to.be.true)
    it('`new Boolean(\'\')` is a boolean type', () =>
      expect(isBoolean(new Boolean(''))).to.be.true)
    it('`undefined` is not a boolean type', () =>
      expect(isBoolean(undefined)).to.be.false)
    it('`null` is not a boolean type', () =>
      expect(isBoolean(null)).to.be.false)
    it('empty string is not a boolean type', () =>
      expect(isBoolean('')).to.be.false)
    it('empty array is not a boolean type', () =>
      expect(isBoolean([])).to.be.false)
    it('empty object is not a boolean type', () =>
      expect(isBoolean({})).to.be.false)
  })

  describe('isNumber', function () {
    it('`0` is a number', () =>
      expect(isNumber(0)).to.be.true)
    it('`1` is a number', () =>
      expect(isNumber(1)).to.be.true)
    it('`-1` is a number', () =>
      expect(isNumber(-1)).to.be.true)
    it('`-1.0234` is a number', () =>
      expect(isNumber(-1.0234)).to.be.true)
    it('new Number(`\'1\')` is a number', () =>
      expect(isNumber(new Number('-1'))).to.be.true)
    it('`\'1\'` is not a number', () =>
      expect(isNumber('1')).to.be.false)
    it('`undefined` is not a number', () =>
      expect(isNumber(undefined)).to.be.false)
    it('`null` is not a number', () =>
      expect(isNumber(null)).to.be.false)
    it('empty string is not a number', () =>
      expect(isNumber('')).to.be.false)
    it('empty array is not a number', () =>
      expect(isNumber([])).to.be.false)
    it('empty object is not a number', () =>
      expect(isNumber({})).to.be.false)
    it('bigint is not a number', () =>
      expect(isNumber(BigInt(233))).to.be.false)
  })

  describe('isString', function () {
    it('`\'x\'` is a string', () =>
      expect(isString('x')).to.be.true)
    it('`new String(1)` is a string', () =>
      expect(isString(new String(1))).to.be.true)
    it('`undefined` is not a string', () =>
      expect(isString(undefined)).to.be.false)
    it('`null` is not a string', () =>
      expect(isString(null)).to.be.false)
    it('empty string is a string', () =>
      expect(isString('')).to.be.true)
    it('empty array is not a string', () =>
      expect(isString([])).to.be.false)
    it('empty object is not a string', () =>
      expect(isString({})).to.be.false)
  })

  describe('isBigint', function () {
    it('`BigInt(0)` is a bigint', () =>
      expect(isBigint(BigInt(0))).to.be.true)
    it('`0` is not a bigint', () =>
      expect(isBigint(0)).to.be.false)
    it('`undefined` is not a bigint', () =>
      expect(isBigint(undefined)).to.be.false)
    it('`null` is not a bigint', () =>
      expect(isBigint(null)).to.be.false)
    it('empty string is not a bigint', () =>
      expect(isBigint('')).to.be.false)
    it('empty array is not a bigint', () =>
      expect(isBigint([])).to.be.false)
    it('empty object is not a bigint', () =>
      expect(isBigint({})).to.be.false)
  })

  describe('isSymbol', function () {
    it('`Symbol(\'x\')` is a symbol', () =>
      expect(isSymbol(Symbol('x'))).to.be.true)
    it('`Symbol.for(\'x\')` is a symbol', () =>
      expect(isSymbol(Symbol.for('x'))).to.be.true)
    it('`undefined` is not a symbol', () =>
      expect(isSymbol(undefined)).to.be.false)
    it('`null` is not a symbol', () =>
      expect(isSymbol(null)).to.be.false)
    it('literal string is not a symbol', () =>
      expect(isSymbol('x')).to.be.false)
    it('empty array is not a symbol', () =>
      expect(isSymbol([])).to.be.false)
    it('empty object is not a symbol', () =>
      expect(isSymbol({})).to.be.false)
  })

  describe('isInteger', function () {
    it('`-1` is a integer', () =>
      expect(isInteger(-1)).to.be.true)
    it('new Number(`\'1\')` is a integer', () =>
      expect(isInteger(new Number('-1'))).to.be.true)
    it('`1.000` is not a integer', () =>
      expect(isInteger(1.000)).to.be.true)
    it('`1.002` is not a integer', () =>
      expect(isInteger(1.002)).to.be.false)
    it('`undefined` is not a integer', () =>
      expect(isInteger(undefined)).to.be.false)
    it('`null` is not a integer', () =>
      expect(isInteger(null)).to.be.false)
    it('literal string is not a integer', () =>
      expect(isInteger('x')).to.be.false)
    it('empty array is not a integer', () =>
      expect(isInteger([])).to.be.false)
    it('empty object is not a integer', () =>
      expect(isInteger({})).to.be.false)
    it('bigint is not a integer', () =>
      expect(isInteger(BigInt(1))).to.be.false)
  })

  describe('isArray', function () {
    it('`new Array(3)` is an array', () =>
      expect(isArray(new Array(3))).to.be.true)
    it('`[1, 2, \'x\']` is an array', () =>
      expect(isArray([1, 2, 'x'])).to.be.true)
    it('`undefined` is not an array', () =>
      expect(isArray(undefined)).to.be.false)
    it('`null` is not an array', () =>
      expect(isArray(null)).to.be.false)
    it('string is not an array', () =>
      expect(isArray('x')).to.be.false)
    it('empty object is not an array', () =>
      expect(isArray({})).to.be.false)
    it('empty array is an array', () =>
      expect(isArray([])).to.be.true)
    it('array like object is not an array', () =>
      expect(isArray({ 1: 'waw' })).to.be.false)
  })

  describe('isObject', function () {
    it('`new Object()` is an object', () =>
      expect(isObject(new Object())).to.be.true)
    it('array like object is an object', () =>
      expect(isObject({ 1: 'waw' })).to.be.true)
    it('empty object is an object', () =>
      expect(isObject({})).to.be.true)
    it('function is not an object', () =>
      expect(isObject(new Function('console.log(\'waw\')'))).to.be.false)
    it('`undefined` is not an object', () =>
      expect(isObject(undefined)).to.be.false)
    it('`null` is not an object', () =>
      expect(isObject(null)).to.be.false)
  })

  describe('isFunction', function () {
    it('lambda expressions is a function', () =>
      expect(isFunction(() => { })).to.be.true)
    it('anonymous function is a function', () =>
      expect(isFunction(() => { })).to.be.true)
    it('instance of Function is a function', () =>
      expect(isFunction(new Function('console.log(\'waw\')'))).to.be.true)
    it('empty object is not a function', () =>
      expect(isFunction({})).to.be.false)
    it('function string is not a function', () =>
      expect(isFunction('function f () {console.log(\'waw\')}')).to.be.false)
    it('`undefined` is not a function', () =>
      expect(isFunction(undefined)).to.be.false)
    it('`null` is not a function', () =>
      expect(isFunction(null)).to.be.false)
  })

  describe('isPrimitiveBoolean', function () {
    it('`false` is a primitive boolean', () =>
      expect(isPrimitiveBoolean(false)).to.be.true)
    it('`true` is a primitive boolean', () =>
      expect(isPrimitiveBoolean(true)).to.be.true)
    it('`new Boolean(false)` is not a primitive boolean type', () =>
      expect(isPrimitiveBoolean(new Boolean(false))).to.be.false)
    it('`new Boolean(true)` is not a primitive boolean type', () =>
      expect(isPrimitiveBoolean(new Boolean(true))).to.be.false)
    it('`undefined` is not a primitive boolean', () =>
      expect(isPrimitiveBoolean(undefined)).to.be.false)
    it('`undefined` is not a primitive boolean', () =>
      expect(isPrimitiveBoolean(undefined)).to.be.false)
    it('`null` is not a primitive boolean', () =>
      expect(isPrimitiveBoolean(null)).to.be.false)
  })

  describe('isPrimitiveNumber', function () {
    it('`0` is a primitive number', () =>
      expect(isPrimitiveNumber(0)).to.be.true)
    it('`1` is a primitive number', () =>
      expect(isPrimitiveNumber(1)).to.be.true)
    it('`-1` is a primitive number', () =>
      expect(isPrimitiveNumber(-1)).to.be.true)
    it('`-1.0234` is a primitive number', () =>
      expect(isPrimitiveNumber(-1.0234)).to.be.true)
    it('new Number(`\'1\')` is not a primitive number', () =>
      expect(isPrimitiveNumber(new Number('-1'))).to.be.false)
    it('`\'1\'` is not a primitive number', () =>
      expect(isPrimitiveNumber('1')).to.be.false)
    it('`undefined` is not a primitive number', () =>
      expect(isPrimitiveNumber(undefined)).to.be.false)
    it('`null` is not a primitive number', () =>
      expect(isPrimitiveNumber(null)).to.be.false)
    it('empty string is not a primitive number', () =>
      expect(isPrimitiveNumber('')).to.be.false)
    it('empty array is not a primitive number', () =>
      expect(isPrimitiveNumber([])).to.be.false)
    it('empty object is not a primitive number', () =>
      expect(isPrimitiveNumber({})).to.be.false)
    it('bigint is not a primitive number', () =>
      expect(isPrimitiveNumber(BigInt(233))).to.be.false)
  })

  describe('isPrimitiveInteger', function () {
    it('`-1` is a primitive integer', () =>
      expect(isPrimitiveInteger(-1)).to.be.true)
    it('new Number(`1`) is not a primitive integer', () =>
      expect(isPrimitiveInteger(new Number(1))).to.be.false)
    it('`1.000` is not a primitive integer', () =>
      expect(isPrimitiveInteger(1.000)).to.be.true)
    it('`1.002` is not a primitive integer', () =>
      expect(isPrimitiveInteger(1.002)).to.be.false)
    it('`undefined` is not a primitive integer', () =>
      expect(isPrimitiveInteger(undefined)).to.be.false)
    it('`null` is not a primitive integer', () =>
      expect(isPrimitiveInteger(null)).to.be.false)
    it('literal string is not a primitive integer', () =>
      expect(isPrimitiveInteger('x')).to.be.false)
    it('empty array is not a primitive integer', () =>
      expect(isPrimitiveInteger([])).to.be.false)
    it('empty object is not a primitive integer', () =>
      expect(isPrimitiveInteger({})).to.be.false)
    it('bigint is not a primitive integer', () =>
      expect(isPrimitiveInteger(BigInt(1))).to.be.false)
  })

  describe('isPrimitiveString', function () {
    it('`\'x\'` is a primitive string', () =>
      expect(isPrimitiveString('x')).to.be.true)
    it('`new String(\'x\')` is not a primitive string', () =>
      expect(isPrimitiveString(new String('x'))).to.be.false)
    it('`undefined` is not a primitive string', () =>
      expect(isPrimitiveString(undefined)).to.be.false)
    it('`null` is not a primitive string', () =>
      expect(isPrimitiveString(null)).to.be.false)
    it('primitive empty string is a primitive string', () =>
      expect(isPrimitiveString('')).to.be.true)
    it('empty array is not a primitive string', () =>
      expect(isPrimitiveString([])).to.be.false)
    it('empty object is not a primitive string', () =>
      expect(isPrimitiveString({})).to.be.false)
  })

  describe('isNotEmptyString', function () {
    it('`\'x\'` is a non-empty string', () =>
      expect(isNotEmptyString('x')).to.be.true)
    it('`\'\'` is not a non-empty string', () =>
      expect(isNotEmptyString('')).to.be.false)
    it('`new String(\'x\')` is a non-empty string', () =>
      expect(isNotEmptyString(new String('x'))).to.be.true)
    it('`undefined` is not a non-empty string', () =>
      expect(isNotEmptyString(undefined)).to.be.false)
    it('`null` is not a non-empty string', () =>
      expect(isNotEmptyString(null)).to.be.false)
    it('empty string is not a non-empty string', () =>
      expect(isNotEmptyString('')).to.be.false)
    it('empty array is not a non-empty string', () =>
      expect(isNotEmptyString([])).to.be.false)
    it('empty object is not a non-empty string', () =>
      expect(isNotEmptyString({})).to.be.false)
  })

  describe('isNotEmptyArray', function () {
    it('`new Array(3)` is a non-empty array', () =>
      expect(isNotEmptyArray(new Array(3))).to.be.true)
    it('`[1, 2, \'x\']` is a non-empty array', () =>
      expect(isNotEmptyArray([1, 2, 'x'])).to.be.true)
    it('`undefined` is not a non-empty array', () =>
      expect(isNotEmptyArray(undefined)).to.be.false)
    it('`null` is not a non-empty array', () =>
      expect(isNotEmptyArray(null)).to.be.false)
    it('string is not a non-empty array', () =>
      expect(isNotEmptyArray('x')).to.be.false)
    it('empty object is not a non-empty array', () =>
      expect(isNotEmptyArray({})).to.be.false)
    it('empty array is not a non-empty array', () =>
      expect(isNotEmptyArray([])).to.be.false)
    it('non-empty array like object is not a non-empty array', () =>
      expect(isNotEmptyArray({ 1: 'waw' })).to.be.false)
  })

  describe('isEmptyObject', function () {
    it('`new Object()` is an empty object', () =>
      expect(isEmptyObject(new Object())).to.be.true)
    it('`new Object({ x: 1 })` is not an empty object', () =>
      expect(isEmptyObject(new Object({ x: 1 }))).to.be.false)
    it('empty object is an empty object', () =>
      expect(isEmptyObject({})).to.be.true)
    it('function is not an empty object', () =>
      expect(isEmptyObject(new Function('console.log(\'waw\')'))).to.be.false)
    it('`undefined` is not an empty object', () =>
      expect(isEmptyObject(undefined)).to.be.false)
    it('`null` is not an empty object', () =>
      expect(isEmptyObject(null)).to.be.false)
  })

  describe('isNotEmptyObject', function () {
    it('`new Object()` is a non-empty object', () =>
      expect(isNotEmptyObject(new Object())).to.be.false)
    it('`new Object({ x: 1 })` is a non-empty object', () =>
      expect(isNotEmptyObject(new Object({ x: 1 }))).to.be.true)
    it('array like object is a non-empty object', () =>
      expect(isNotEmptyObject({ 1: 'waw' })).to.be.true)
    it('empty object is not a non-empty object', () =>
      expect(isNotEmptyObject({})).to.be.false)
    it('function is not a non-empty object', () =>
      expect(isNotEmptyObject(new Function('console.log(\'waw\')'))).to.be.false)
    it('`undefined` is not a non-empty object', () =>
      expect(isNotEmptyObject(undefined)).to.be.false)
    it('`null` is not a non-empty object', () =>
      expect(isNotEmptyObject(null)).to.be.false)
  })

  describe('isNumberLike', function () {
    it('`0` is a number like', () =>
      expect(isNumberLike(0)).to.be.true)
    it('`1` is a number like', () =>
      expect(isNumberLike(1)).to.be.true)
    it('`-1` is a number like', () =>
      expect(isNumberLike(-1)).to.be.true)
    it('`-1.0234` is a number like', () =>
      expect(isNumberLike(-1.0234)).to.be.true)
    it('new Number(`\'1\')` is a number like', () =>
      expect(isNumberLike(new Number('-1'))).to.be.true)
    it('`\'1\'` is a number like', () =>
      expect(isNumberLike('1')).to.be.true)
    it('`\'1x\'` is a number like', () =>
      expect(isNumberLike('1x')).to.be.false)
    it('`undefined` is not a number like', () =>
      expect(isNumberLike(undefined)).to.be.false)
    it('`null` is not a number like', () =>
      expect(isNumberLike(null)).to.be.false)
    it('empty string is not a number like', () =>
      expect(isNumberLike('')).to.be.false)
    it('empty array is not a number like', () =>
      expect(isNumberLike([])).to.be.false)
    it('empty object is not a number like', () =>
      expect(isNumberLike({})).to.be.false)
    it('bigint is not a number like', () =>
      expect(isNumberLike(BigInt(233))).to.be.false)
  })
})
