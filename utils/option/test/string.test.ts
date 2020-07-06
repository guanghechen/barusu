import { expect } from 'chai'
import { describe, it } from 'mocha'
import {
  toCamelCase,
  toCapitalCase,
  toConstantCase,
  toDotCase,
  toKebabCase,
  toLowerCase,
  toPascalCase,
  toPathCase,
  toSentenceCase,
  toSnakeCase,
  toTitleCase,
  toUpperCase,
} from '../src'


describe('string', function () {
  describe('toLowerCase', function () {
    it('\'TEST STRING\' => \'test string\'', () =>
      expect(toLowerCase('TEST STRING')).to.equal('test string'))
  })

  describe('toUpperCase', function () {
    it('\'test string\' => \'TEST STRING\'', () =>
      expect(toUpperCase('test string')).to.be.equal('TEST STRING'))
  })

  describe('toCapitalCase', function () {
    it('\'test string\' => \'Test String\'', () =>
      expect(toCapitalCase('test string')).to.be.equal('Test String'))
  })

  describe('toPascalCase', function () {
    it('\'test string\' => \'TestString\'', () =>
      expect(toPascalCase('test string')).to.be.equal('TestString'))
  })

  describe('toCamelCase', function () {
    it('\'test string\' => \'testString\'', () =>
      expect(toCamelCase('test string')).to.be.equal('testString'))
  })

  describe('toConstantCase', function () {
    it('\'test string\' => \'TEST_STRING\'', () =>
      expect(toConstantCase('test string')).to.be.equal('TEST_STRING'))
  })

  describe('toKebabCase', function () {
    it('\'test string\' => \'test-string\'', () =>
      expect(toKebabCase('test string')).to.be.equal('test-string'))
  })

  describe('toSnakeCase', function () {
    it('\'test string\' => \'test_string\'', () =>
      expect(toSnakeCase('test string')).to.be.equal('test_string'))
  })

  describe('toSnakeCase', function () {
    it('\'test string\' => \'test_string\'', () =>
      expect(toSnakeCase('test string')).to.be.equal('test_string'))
  })

  describe('toPathCase', function () {
    it('\'test string\' => \'test/string\'', () =>
      expect(toPathCase('test string')).to.be.equal('test/string'))
  })

  describe('toSentenceCase', function () {
    it('\'testString\' => \'Test string\'', () =>
      expect(toSentenceCase('testString')).to.be.equal('Test string'))
  })

  describe('toTitleCase', function () {
    it('\'a simple test\' => \'A Simple Test\'', () =>
      expect(toTitleCase('a simple test')).to.be.equal('A Simple Test'))
  })

  describe('toDotCase', function () {
    it('\'test string\' => \'test.string\'', () =>
      expect(toDotCase('test string')).to.be.equal('test.string'))
  })
})
