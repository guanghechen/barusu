import * as chai from 'chai'
import chaiExclude from 'chai-exclude'
import fs from 'fs-extra'
import path from 'path'
import {
  FileTestCase,
  FileTestCaseMaster,
  FileTestCaseMasterProps,
} from '@barusu/util-mocha'
import {
  DSCResult,
  DSchema,
  DVResult,
  DataHandleResultException,
  configurationMaster,
} from '../../src'

chai.use(chaiExclude)
const { expect } = chai

/**
 * the content format in the input file of the DataValidator test case
 *
 * DataValidator 测试用例的输入文件中的内容格式
 */
export interface DataValidatorTestCaseInputData {
  /**
   * the path where the DataSchema corresponding to this test data is located (a relative path can be used)
   *
   * 此测试数据对应的 DataSchema 所在的路径（可使用相对路径）
   */
  schema: string
  /**
   * input data list, each element is a complete data type defined by DataSchema
   *
   * 输入数据列表，每个元素都是一个完整的对应 DataSchema 所定义的数据类型
   */
  cases: any[]
}

/**
 * expected verification results for the DataValidator test case
 *
 * DataValidator 测试用例的预期校验结果
 */
export type DataValidatorTestCaseAnswerData = any[]

/**
 * 输出数据
 */
export interface DataValidatorOutputData {
  value: DSCResult['value']
  errors: DSCResult['errors']
  warnings: DSCResult['warnings']
}

/**
 * DataSchema 编译器测试用例辅助类
 */
export class DataValidatorTestCaseMaster extends FileTestCaseMaster<
  DVResult[],
  DataValidatorOutputData[]
> {
  public constructor({
    caseRootDirectory,
    inputFileNameSuffix = 'input.json',
    answerFileNameSuffix = 'answer.json',
  }: PickPartial<
    FileTestCaseMasterProps,
    'inputFileNameSuffix' | 'answerFileNameSuffix'
  >) {
    super({ caseRootDirectory, inputFileNameSuffix, answerFileNameSuffix })
  }

  // override
  public async consume(kase: FileTestCase): Promise<DVResult[] | never> {
    const { dir, inputFilePath } = kase
    const inputData: DataValidatorTestCaseInputData = await fs.readJSON(
      inputFilePath,
    )
    const { schema: schemaFilePath, cases } = inputData
    const absoluteSchemaFilePath = path.resolve(dir, schemaFilePath)

    // DataSchema not found
    if (!fs.existsSync(absoluteSchemaFilePath)) {
      throw `[Error] bad schema: ${absoluteSchemaFilePath} is not exists.`
    }

    const rawDataSchema = await fs.readJSON(absoluteSchemaFilePath)
    const CompileResult: DSCResult = configurationMaster.compile(rawDataSchema)

    // DataSchema is invalid
    if (CompileResult.hasError) {
      throw `[Error] bad schema: ${absoluteSchemaFilePath} exists errors: ${CompileResult.errorDetails}`
    }

    if (CompileResult.hasWarning) {
      console.log(
        `[Warning] schema: ${absoluteSchemaFilePath} exists warnings: ${CompileResult.warningDetails}`,
      )
    }

    const schema: DSchema = CompileResult.value!
    const results: DVResult[] = []
    for (const data of cases) {
      const result = configurationMaster.validate(schema, data)
      results.push(result)
    }
    return results
  }

  // override
  public async check(outputs: DVResult[], answers: DVResult[]): Promise<void> {
    // 输出和答案应有相同的数据数
    expect(outputs).to.be.an('array').to.have.lengthOf(answers.length)

    const outputDataList = this.toJSON(outputs)
    const answerDataList = this.toJSON(answers)

    for (let i = 0; i < outputDataList.length; ++i) {
      const outputData = outputDataList[i]
      const answerData = answerDataList[i]

      // check errors
      if (answerData.errors != null && answerData.errors.length > 0) {
        expect(outputData.errors)
          .to.be.an('array')
          .to.have.lengthOf(answerData.errors.length)
        expect(outputData.errors)
          .excludingEvery('reason')
          .to.deep.equal(answerData.errors)
      }

      // check warnings
      if (answerData.warnings != null && answerData.warnings.length > 0) {
        expect(outputData.warnings)
          .to.be.an('array')
          .to.have.lengthOf(answerData.warnings.length)
        expect(outputData.warnings)
          .excludingEvery('reason')
          .to.deep.equal(answerData.warnings)
      }

      // check data
      expect(outputData.value).to.deep.equal(answerData.value)
    }
  }

  // override
  public toJSON(data: DVResult[]): DataValidatorOutputData[] {
    const mapper = (x: DataHandleResultException) => {
      const result: DataHandleResultException = {
        constraint: x.constraint,
        reason: x.reason,
      }
      if (x.property != null) result.property = x.property
      if (x.traces != null) result.traces = x.traces.map(mapper)
      return result
    }
    const result: DataValidatorOutputData[] = data.map(d => ({
      value: d.value,
      errors: d.errors.map(mapper),
      warnings: d.warnings.map(mapper),
    }))
    return result
  }
}
