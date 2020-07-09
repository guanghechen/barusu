import fs from 'fs-extra'
import path from 'path'
import {
  DirTestCaseMaster,
  DirTestCaseMasterProps,
} from '@lemon-clown/mocha-test-master'


/**
 * DataSchema 编译器测试用例辅助类
 */
export class CommandTestCaseMaster extends DirTestCaseMaster {
  public constructor({
    encoding = 'utf-8',
    caseRootDirectory,
    checkIfTestDir,
  }: PickPartial<DirTestCaseMasterProps, 'encoding' | 'checkIfTestDir'>) {
    if (checkIfTestDir == null) {
      // eslint-disable-next-line no-param-reassign
      checkIfTestDir = (dirPath: string): boolean => {
        if (fs.existsSync(path.join(dirPath, 'app.yml'))) return true
        if (fs.existsSync(path.join(dirPath, 'api.yml'))) return true
        return false
      }
    }
    super({ encoding, caseRootDirectory, checkIfTestDir })
  }
}
