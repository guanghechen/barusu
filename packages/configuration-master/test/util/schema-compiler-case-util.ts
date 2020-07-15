import * as chai from 'chai'
import chaiExclude from 'chai-exclude'
import fs from 'fs-extra'
import {
  FileTestCase,
  FileTestCaseMaster,
  FileTestCaseMasterProps,
} from '@barusu/util-mocha'
import {
  DSCResult,
  DataHandleResultException,
  ConfigurationMaster,
  RDSchema,
} from '../../src'


chai.use(chaiExclude)
const { expect } = chai


/**
 * 输出数据
 */
export interface DataSchemaCompilerOutputData {
  value: DSCResult['value']
  errors: DSCResult['errors']
  warnings: DSCResult['warnings']
}


/**
 * DataSchema 编译器测试用例辅助类
 */
export class DataSchemaCompilerTestCaseMaster extends FileTestCaseMaster<DSCResult, DataSchemaCompilerOutputData> {
  protected readonly configurationMaster: ConfigurationMaster

  public constructor(configurationMaster: ConfigurationMaster, {
    caseRootDirectory,
    inputFileNameSuffix = 'schema.json',
    answerFileNameSuffix = 'schema.answer.json',
  }: PickPartial<FileTestCaseMasterProps, 'inputFileNameSuffix' | 'answerFileNameSuffix'>) {
    super({ caseRootDirectory, inputFileNameSuffix, answerFileNameSuffix })
    this.configurationMaster = configurationMaster
  }

  // override
  public async consume(kase: FileTestCase): Promise<DSCResult | never> {
    const { inputFilePath: schemaFilePath } = kase
    const rawDataSchema: RDSchema = await fs.readJSON(schemaFilePath)
    const CompileResult: DSCResult = this.configurationMaster.compile(rawDataSchema)
    return CompileResult
  }

  // override
  public async check(output: DSCResult, answer: DSCResult): Promise<void> {
    const outputData: DataSchemaCompilerOutputData = this.toJSON(output)
    const answerData: DataSchemaCompilerOutputData = answer

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

    // check data, ignore undefined property
    const outputDataValue = JSON.parse(super.stringify(outputData.value as any))
    const answerDataValue = answerData.value
    expect(outputDataValue).to.deep.equal(answerDataValue)

    // check load
    if (answer.value != null) {
      const answerSchema = this.configurationMaster.parseJSON(answer.value)
      const answerJson = JSON.parse(JSON.stringify(this.configurationMaster.toJSON(answerSchema)))
      expect(outputDataValue).to.deep.equal(answerJson)
    }
  }

  // override
  public toJSON(data: DSCResult): DataSchemaCompilerOutputData {
    const mapper = (x: DataHandleResultException) => {
      const result: DataHandleResultException = { constraint: x.constraint, reason: x.reason }
      if (x.property != null) result.property = x.property
      if (x.traces != null) result.traces = x.traces.map(mapper)
      return result
    }

    const result: DataSchemaCompilerOutputData = {
      value: data.value == null ? data.value : this.configurationMaster.toJSON(data.value) as any,
      errors: data.errors.map(mapper),
      warnings: data.warnings.map(mapper),
    }
    return result
  }
}
