/* eslint-disable jest/no-export */
import fs from 'fs-extra'

/**
 * Case node without children
 */
export interface CaseLeafNode {
  /**
   * Case title
   */
  title: string
  /**
   * Case input
   */
  input?: unknown
  /**
   * Case inputs
   */
  inputs?: unknown[]
}

/**
 * Case node with children
 */
export interface CaseParentNode {
  /**
   * Case title
   */
  title: string
  /**
   * sub cases
   */
  cases: Array<CaseParentNode | CaseLeafNode>
}

export type CaseTree = CaseParentNode
export type CaseNode = CaseParentNode | CaseLeafNode

/**
 * Case item passed to doTest func
 */
export interface CaseItem {
  /**
   * Case title
   */
  title: string
  /**
   * Case inputs
   */
  input: unknown
}

export function runCaseTree<C extends CaseItem>(
  caseFilepath: string,
  doTest: (kase: C) => void | Promise<void>,
): void {
  const createTest = function (caseNode: CaseNode): void {
    if ((caseNode as CaseParentNode).cases != null) {
      const u: CaseParentNode = caseNode as CaseParentNode
      // eslint-disable-next-line jest/valid-title
      describe(u.title, function () {
        for (const v of u.cases) {
          createTest(v)
        }
      })
      return
    }

    const u: CaseLeafNode = caseNode as CaseLeafNode

    const { title, input, inputs, ...others } = u
    const mergedInputs: unknown[] = []
    if (input != null) mergedInputs.push(input)
    if (inputs != null) mergedInputs.push(...inputs)

    // eslint-disable-next-line jest/valid-title, jest/expect-expect
    test(title, async function () {
      for (const item of mergedInputs) {
        const kase = ({
          ...others,
          title,
          input: item,
        } as unknown) as C
        await doTest(kase)
      }
    })
  }

  const caseTree: CaseTree = fs.readJSONSync(caseFilepath)
  createTest(caseTree)
}
