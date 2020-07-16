import { DSchema, DataSchema, TDSchema } from '../schema'
import { DataValidationResult } from './result'


// short format of DataValidationResult (value?: DataSchema)
export type DVResult = DataValidationResult<string, any, DSchema>

// short format of DataValidationResult (value?: TopDataSchema)
export type TDVResult = DataValidationResult<string, any, TDSchema>

// short format of DataValidator
export type DValidator = DataValidator<string, any, DSchema>

// short format of DataValidatorFactory
export type DVFactory = DataValidatorFactory<string, any, DSchema>

// short format of DataValidatorFactoryConstructor
export type DVFactoryConstructor = DataValidatorFactoryConstructor<string, any, DSchema>


/**
 * the context of DataSchemaValidator
 *
 * 数据校验器的上下文
 */
export interface DataValidatorContext {
  /**
   * - Check if the data matches the given data pattern.
   * - Compile the data (calculate the final result of the data by the
   *   value of attributes such as default)
   *
   * 校验数据是否匹配给定的数据模式 & 编译数据（通过 default 等属性的值以计算数据的最终结果）
   * @param schema  预期的数据模式
   * @param data    待校验的数据
   */
  validateDataSchema(schema: DSchema, data: any): DVResult
  /**
   * Validate the top-level DataSchema, which has unique attributes such as definitions
   * and is a unit of the configuration file
   *
   * 校验顶层 DataSchema，顶层 DataSchema 中拥有 definitions 等独有属性，是配置文件的单元
   * @param schema  预期的数据模式
   * @param data    待校验的数据
   */
  validateTopDataSchema(schema: TDSchema, data: any): TDVResult
  /**
   * Get DefinitionDataSchema by id/path of DefinitionDataSchema
   *
   * 通过 id/path 获取 DefinitionDataSchema
   * @param idOrPath
   */
  getDefinition(idOrPath: string): DSchema | undefined
}


/**
 * data validator
 *
 * 数据校验器
 */
export interface DataValidator<T extends string, V, DS extends DataSchema<T, V>> {
  /**
   * Corresponds to the type in DataSchema, used as a unique identifier,
   * indicating what type of DataSchema instance the validator receives
   *
   * 对应 DataSchema 中的 type，用作唯一标识，表示该校验器接收何种类型的 DataSchema 实例
   */
  readonly type: T
  /**
   * Validate the data & compile the data (calculate the final result of the data
   * by the value of attributes such as default)
   *
   * 校验数据 & 编译数据（通过 default 等属性的值以计算数据的最终结果）
   * @param data
   */
  validate(data: any): DataValidationResult<T, V, DS>
  /**
   * 类型数据类型检查是否匹配指定的类型
   * @param data    当前待校验的数据
   * @param result  当前的校验结果
   */
  checkType(data: any, result: DVResult): data is V
  /**
   * 预处理数据
   * @param data
   */
  preprocessData(data: any, result: DVResult): V | undefined
}


/**
 * Factory class for data validator
 *
 * 数据校验器的工厂类
 */
export interface DataValidatorFactory<T extends string, V, DS extends DataSchema<T, V>> {
  /**
   * Corresponds to the type in DataSchema, used as a unique identifier,
   * indicating what type of validator the validator factory class produces
   *
   * 对应 DataSchema 中的 type，用作唯一标识
   * 表示该校验器工厂类生产何种类型的校验器
   */
  readonly type: T
  /**
   * Create a corresponding data validator through DataSchema
   *
   * 通过 DataSchema 创建与之对应的数据校验器
   * @param schema
   */
  create (schema: DS): DataValidator<T, V, DS>
}


/**
 * DataValidator's constructor interface
 *
 * DataValidator 工厂类的构造函数接口
 */
export interface DataValidatorFactoryConstructor<
  T extends string,
  V,
  DS extends DataSchema<T, V>,
> {
  /**
   * constructor of DataValidatorFactory<T, V, DS>
   *
   * @param context   the context of DataValidator
   */
  new (context: DataValidatorContext): DataValidatorFactory<T, V, DS>
}
