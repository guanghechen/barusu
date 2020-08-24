import { expect } from 'chai'
import { defaultMergeStrategies, merge } from '../src/merge'


describe('merge', function () {
  describe('simple', function () {
    const options = [
      { x: 1, y: 'x', c: true, d: Symbol.for('x'), f: null, g: undefined },
      { x: 23, e: BigInt(2), y: null },
      { f: 'waw', g: 'dd' },
      { f: null, g: 'ss' },
    ]

    it('default strategies', function () {
      expect(
        merge(options)
      ).to.eql({
        x: 23, y: 'x', c: true, d: Symbol.for('x'), e: BigInt(2), f: 'waw', g: 'ss'
      })
    })

    it('retain', function () {
      expect(
        merge(options, {
          x: defaultMergeStrategies.retain,
          g: defaultMergeStrategies.retain })
      ).to.eql({
        x: 1, y: 'x', c: true, d: Symbol.for('x'), e: BigInt(2), f: 'waw', g: 'dd'
      })
    })
  })

  describe('array', function () {
    const options = [
      { a: [], b: [1] },
      { a: [1, 2], b: ['x', 'y'] },
      { b: ['waw'], e: 'dd' },
      { a: undefined, b: 'ss' },
      { b: { 1: 'ss' } },
    ]
    it('concat -- 1', function () {
      expect(
        merge(options, {
          a: defaultMergeStrategies.concat,
          b: defaultMergeStrategies.retain })
      ).to.eql({
        a: [1, 2],
        b: [1],
        e: 'dd',
      })
    })
    it('concat -- 2', function () {
      expect(
        merge(options, {
          a: defaultMergeStrategies.retain,
          b: defaultMergeStrategies.concat })
      ).to.eql({
        a: [],
        b: [1, 'x', 'y', 'waw'],
        e: 'dd',
      })
    })
  })

  describe('object', function () {
    const options = [
      { a: { x: [1, 2], y: 'waw' }, b: { a: 1 } },
      { a: { x: 1, z: 2 }, b: { a: ['x', 'y'] } },
      { a: undefined, b: null },
    ]
    it('assign -- 1', function () {
      expect(
        merge(options, {
          a: defaultMergeStrategies.assign,
          b: defaultMergeStrategies.retain })
      ).to.eql({
        a: { x: 1, y: 'waw', z: 2 },
        b: { a: 1 },
      })
    })
    it('assign -- 2', function () {
      expect(
        merge(options, {
          a: defaultMergeStrategies.assign,
          b: defaultMergeStrategies.assign })
      ).to.eql({
        a: { x: 1, y: 'waw', z: 2 },
        b: { a: ['x', 'y'] },
      })
    })
  })
})
