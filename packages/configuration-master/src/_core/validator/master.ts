import { stringify } from '../../_util/string-util'
import { DSchema, TDSchema, TopDataSchemaMaster } from '../schema'
import { DataValidationResult } from './result'
import { DVFactory, DVResult, DataValidatorContext, TDVResult } from './types'


/**
 * Data validator management object
 *  - Registration operation: make the data corresponding to a user-defined Schema type be verified correctly
 *  - Replace operation: replace a data validator of the original type
 *  - Parsing operation: for the specified Schema object and data object,
 *    verify that the data conforms to the definition of this Schema
 *
 * 数据校验器的管理对象
 *  - 注册操作：使得一个用户自定义的 Schema 类型对应的数据能被正确校验
 *  - 替换操作：替换一个原有类型的数据校验器
 *  - 编译操作：对于指定的 Schema 对象和数据对象，校验数据是否符合此 Schema 的定义
 */
export class DataValidatorMaster implements DataValidatorContext {
  /**
   * Mapping of the DataSchema.type and DataValidator
   *
   * DataSchema.type 和 DataValidator 的映射
   */
  protected readonly validatorFactoryMap: Map<string, DVFactory>
  /**
   * TopDataSchema management object instance for resolving reference nodes
   *
   * 顶层数据模式管理对象实例，用于校验引用节点
   */
  protected readonly topDataSchemaMaster: TopDataSchemaMaster

  public constructor(validatorFactoryMap?: Map<string, DVFactory>) {
    this.validatorFactoryMap = validatorFactoryMap != null ? validatorFactoryMap : new Map()
    this.topDataSchemaMaster = new TopDataSchemaMaster()
  }

  /**
   * Add DataValidatorFactory, if the specified type already exists, ignore this addition
   *
   * 添加 DataValidatorFactory，若指定的 type 已存在，则忽略此次添加
   * @param type
   * @param dataValidatorFactory
   */
  public registerValidatorFactory (type: string, dataValidatorFactory: DVFactory): void {
    if (this.validatorFactoryMap.has(type)) return
    this.validatorFactoryMap.set(type, dataValidatorFactory)
  }

  /**
   * Overwrite the existing DataValidatorFactory.
   * If there is no corresponding DataValidatorFactory before the specified type, add it
   *
   * 覆盖已有的 DataValidatorFactory，若指定的 type 之前没有对应的 DataValidatorFactory，也做添加操作
   * @param type
   * @param dataValidatorFactory
   */
  public replaceValidatorFactory (type: string, dataValidatorFactory: DVFactory) {
    this.validatorFactoryMap.set(type, dataValidatorFactory)
  }

  /**
   * override method
   * @see DataValidatorContext#validateDataSchema
   */
  public validateDataSchema(schema: DSchema, data: any): DVResult {
    // 获取 DataValidatorFactory
    const validatorFactory = this.validatorFactoryMap.get(schema.type)
    if (validatorFactory == null) {
      const result: DVResult = new DataValidationResult(schema)
      return result.addError({
        constraint: 'type',
        reason: `unknown schema type: ${ stringify(schema.type) }.`
      })
    }

    // 创建 DataValidator，并返回其校验结果
    const validator = validatorFactory.create(schema)
    return validator.validate(data)
  }

  /**
   * override method
   * @see DataValidatorContext#validateTopDataSchema
   */
  public validateTopDataSchema(schema: TDSchema, data: any): TDVResult {
    this.topDataSchemaMaster.setSchema(schema)
    return this.validateDataSchema(schema, data)
  }

  /**
   * override method
   * @see DataValidatorContext#getDefinition
   */
  public getDefinition(idOrPath: string): DSchema | undefined {
    return this.topDataSchemaMaster.getDefinition(idOrPath)
  }
}
