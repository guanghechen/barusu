import path from 'path'
import {
  FileTestCase,
  FileTestCaseMaster,
  FileTestCaseMasterProps,
} from '@barusu/util-mocha'
import { ApiItemParser, ResolvedApiItemGroup } from '../../src'


/**
 * DataSchema 编译器测试用例辅助类
 */
export class ApiItemParserTestCaseMaster
  extends FileTestCaseMaster<ResolvedApiItemGroup[], ResolvedApiItemGroup[]> {
  private readonly parser: ApiItemParser

  public constructor(parser: ApiItemParser, {
    caseRootDirectory,
    inputFileNameSuffix = 'input.yml',
    answerFileNameSuffix = 'answer.json',
  }: PickPartial<FileTestCaseMasterProps, 'inputFileNameSuffix' | 'answerFileNameSuffix'>) {
    super({ caseRootDirectory, inputFileNameSuffix, answerFileNameSuffix })
    this.parser = parser
  }

  // override
  public async consume(kase: FileTestCase): Promise<ResolvedApiItemGroup[] | never> {
    const { inputFilePath } = kase
    this.parser.scan(inputFilePath)
    const apiItemGroups = this.parser.collect()
    return apiItemGroups
  }

  // override
  public stringify(data: ResolvedApiItemGroup[]): string {
    const projectDir = path.resolve()
    const stringifyFilter = (key: string, value: any) => {
      // RegExp to string
      if (value instanceof RegExp) {
        return value.source
      }

      // replace absolute path with symbol
      if (typeof value === 'string') {
        if (value.startsWith(projectDir)) {
          return '<PROJECT_DIR>' + value.substr(projectDir.length)
        }
      }

      return value
    }
    return JSON.stringify(data, stringifyFilter, 2)
  }


  // override
  public toJSON(data: ResolvedApiItemGroup[]): ResolvedApiItemGroup[] {
    return JSON.parse(this.stringify(data))
  }
}
