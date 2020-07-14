import { expect } from 'chai'
import fs from 'fs-extra'
import path from 'path'
import { TestCase, TestCaseGroup, TestCaseMaster } from './case-master'


/**
 * test case
 *
 * 测试用例
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DirTestCase extends TestCase {
}


/**
 * test case group
 *
 * 测试用例组
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DirTestCaseGroup extends TestCaseGroup<DirTestCase, DirTestCaseGroup> { }

/**
 * params of TestCaseMaster.constructor
 */
export interface DirTestCaseMasterProps {
  /**
   * files encoding
   */
  encoding: string
  /**
   * root directory of test cases
   */
  caseRootDirectory: string
  /**
   * check if a path is a test input directory
   */
  checkIfTestDir: (dirPath: string) => boolean
}


export abstract class DirTestCaseMaster extends TestCaseMaster<DirTestCase, DirTestCaseGroup> {
  protected readonly encoding: string
  protected readonly checkIfTestDir: (dirPath: string) => boolean

  public constructor({ encoding, caseRootDirectory, checkIfTestDir }: DirTestCaseMasterProps) {
    super(caseRootDirectory)
    this.encoding = encoding
    this.checkIfTestDir = checkIfTestDir
  }

  /**
   * override method
   * @see TestCaseMaster#scan
   */
  public async scan(caseDirectory: string, recursive = true): Promise<this> {
    // eslint-disable-next-line no-param-reassign
    caseDirectory = path.resolve(this.caseRootDirectory, caseDirectory)
    const self = this
    const scan = async (dir: string): Promise<DirTestCaseGroup> => {
      const caseGroup: DirTestCaseGroup = {
        title: path.relative(self.caseRootDirectory, dir),
        subGroups: [],
        cases: [],
      }

      if (this.checkIfTestDir(dir)) {
        caseGroup.cases.push({
          dir,
          title: '.',
        })
        return caseGroup
      }

      const files: string[] = await fs.readdir(dir)
      for (const filename of files) {
        const absoluteFilePath = path.join(dir, filename)
        const stat = await fs.stat(absoluteFilePath)
        if (!stat.isDirectory()) continue

        if (this.checkIfTestDir(absoluteFilePath)) {
          caseGroup.cases.push({
            dir,
            title: filename,
          })
          continue
        }

        // recursive scanning
        if (recursive) {
          const subGroup: DirTestCaseGroup = await scan(absoluteFilePath)
          /**
           * append sub-case groups directly to caseGroup if there are only sub-case groups and no sub-cases
           *
           * 如果只有子案例组而没有子案例，则直接将子案例组追加到 caseGroup 中
           */
          if (subGroup.cases.length > 0) {
            caseGroup.subGroups.push(subGroup)
          } else if (subGroup.subGroups.length > 0) {
            caseGroup.subGroups.push(...subGroup.subGroups)
          }
        }
      }

      return caseGroup
    }

    /**
     * append sub-case groups directly to caseGroup if there are only sub-case groups and no sub-cases
     *
     * 如果只有子案例组而没有子案例，则直接将子案例组追加到 caseGroup 中
     */
    const caseGroup = await scan(caseDirectory)
    if (caseGroup.cases.length > 0) {
      self._caseGroups.push(caseGroup)
    } else if (caseGroup.subGroups.length > 0) {
      self._caseGroups.push(...caseGroup.subGroups)
    }

    return this
  }

  /**
   * Check the similarities and differences between the files in the two paths
   *
   * @param outputPath
   * @param answerPath
   * @param encoding    encoding of the file under the output/answer path
   */
  public compareDirs(
    outputPath: string,
    answerPath: string,
    encoding = this.encoding,
  ): void {
    const outputFiles: string[] = fs.readdirSync(outputPath).sort()
    const answerFiles: string[] = fs.readdirSync(answerPath).sort()
    expect(outputFiles.length).to.equal(answerFiles.length)
    expect(outputFiles).to.deep.equal(answerFiles)
    for (const filename of outputFiles) {
      const absoluteOutputFilePath = path.join(outputPath, filename)
      const absoluteAnswerFilePath = path.join(answerPath, filename)
      const stat = fs.statSync(absoluteOutputFilePath)
      if (stat.isDirectory()) {
        this.compareDirs(absoluteOutputFilePath, absoluteAnswerFilePath, encoding)
        continue
      }
      if (stat.isFile()) {
        const outputContent = fs.readFileSync(absoluteOutputFilePath, encoding)
        const answerContent = fs.readFileSync(absoluteAnswerFilePath, encoding)
        expect(outputContent).to.equal(answerContent)
      }
    }
  }
}
