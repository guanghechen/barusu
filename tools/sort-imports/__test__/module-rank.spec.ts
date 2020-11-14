import path from 'path'
import { CaseItem, runCaseTree } from '@barusu/util-jest'
import { compareModulePath, defaultModuleRankItems } from '../src'


interface CustomCaseItem extends CaseItem {
  /**
   *
   */
  input: {
    /**
     *
     */
    p1: string
    /**
     *
     */
    p2: string
  }
  /**
   *
   */
  answer: string
}


const caseDir = path.resolve(__dirname, 'cases')
runCaseTree(
  path.resolve(caseDir, 'module-rank.json'),
  (kase: CustomCaseItem) => {
    const result = compareModulePath(kase.input.p1, kase.input.p2, [
      {
        regex: /^(react|vue|angular)(?:-[\w\-.]*)?$/,
        rank: 0.1,
      },
      ...defaultModuleRankItems,
    ])
    expect(result).toEqual(kase.answer)
  }
)


test('rank compared within numeric order', function () {
  expect(
    compareModulePath('./a', './b', [
      { regex: /a$/, rank: 1.2 },
      { regex: /b$/, rank: 1.3 },
    ]
  )).toBe(-1)

  expect(
    compareModulePath('./a', './b', [
      { regex: /a$/, rank: 10.1 },
      { regex: /b$/, rank: 3.3 },
    ]
  )).toBe(1)

  expect(
    compareModulePath('./a', './a', [
      { regex: /a$/, rank: 1.10 },
    ]
  )).toBe(0)
})
