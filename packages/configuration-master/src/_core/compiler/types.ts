import {
  DDSchema,
  DSchema,
  DataSchema,
  RDDSchema,
  RDSchema,
  RTDSchema,
  RawDataSchema,
  TDSchema,
} from '../schema'
import { DataSchemaCompileResult } from './result'

// short format of DataSchemaCompileResult (value?: DataSchema)
export type DSCResult = DataSchemaCompileResult<string, any, RDSchema, DSchema>

// short format of DataSchemaCompileResult (value?: DefinitionDataSchema)
export type DDSCResult = DataSchemaCompileResult<
  string,
  any,
  RDDSchema,
  DDSchema
>

// short format of DataSchemaCompileResult (value?: TopDataSchema)
export type TDSCResult = DataSchemaCompileResult<
  string,
  any,
  RTDSchema,
  TDSchema
>

// short format of DataSchemaCompiler
export type DSCompiler = DataSchemaCompiler<string, any, RDSchema, DSchema>

// short format of DataSchemaCompilerConstructor
export type DSCompilerConstructor = DataSchemaCompilerConstructor<
  string,
  any,
  RDSchema,
  DSchema
>

/**
 * the context of DataSchemaCompiler
 *
 * 数据模式编译器的上下文
 */
export interface DataSchemaCompilerContext {
  /**
   * 编译 DataSchema
   * @param rawSchema
   */
  compileDataSchema(rawSchema: RDSchema): DSCResult
  /**
   * Compile DefinitionDataSchema, DefinitionDataSchema defines the type
   * declaration (reusable data schema), and can be referenced by other
   * DataSchemas in the top-level DataSchema; it can also define recursive
   * reference data schema
   *
   * 编译 DefinitionDataSchema，DefinitionDataSchema 定义了类型的声明
   * （可重用的数据模式），可被顶层 DataSchema 中的其它 DataSchema 引用；
   * 也可以定义递归引用的数据模式
   * @param name
   * @param rawSchema
   */
  compileDefinitionDataSchema(
    name: string,
    rawSchema: RDDSchema,
  ): Generator<string, DDSCResult>
  /**
   * Parsing the top-level DataSchema, which has unique attributes
   * such as definitions and is a unit of the configuration file
   *
   * 编译顶层 DataSchema，顶层 DataSchema 中拥有 definitions 等独有属性，是配置文件的单元
   * @param rawSchema
   */
  compileTopDataSchema(rawSchema: RTDSchema): TDSCResult
  /**
   * Check if a RawDefinitionDataSchema with the specified id/path exists
   *
   * 判断是否存在指定的 id/path 的 RawDefinitionDataSchema
   * @param idOrPath
   */
  hasDefinition(idOrPath: string): boolean
  /**
   * Get RawDefinitionDataSchema by id/path of DefinitionDataSchema
   *
   * 通过 id/path 获取 RawDefinitionDataSchema
   * @param idOrPath
   */
  getRawDefinition(idOrPath: string): RDDSchema | undefined
  /**
   * Format rawDataSchema:
   *  - If the rawDataSchema is a string, the schema defined as the type
   *    of this string
   *
   * 格式化 rawDataSchema：
   *  - 当 rawDataSchema 为字符串时，表示定义为此字符串的类型的 Schema
   * @param rawSchema
   */
  normalizeRawSchema(rawSchema: RDSchema): RDSchema
  /**
   * Set the default value of an optional attribute to the value of the
   * corresponding attribute in the parent data schema Record<string, unknown>
   *
   * 将可选属性的默认值置为父数据模式对象中对应属性的值
   * @param parentRawSchema 父数据模式对象
   * @param rawSchema       数据模式对象
   */
  inheritRawSchema<T extends RDSchema>(
    parentRawSchema: RDSchema,
    rawSchema: T,
  ): T
  /**
   * 转换成可被 JSON.stringify 的 JSON 对象
   * @param schema
   */
  topSchemaToJSON(schema: TDSchema): Record<string, unknown>
  /**
   * 将 JSON 转成 TopDataSchema
   * @param json
   */
  parseTopSchemaJSON(json: Record<string, unknown>): TDSchema
  /**
   * 转换成可被 JSON.stringify 的 JSON 对象
   * @param schema
   */
  definitionSchemaToJSON(schema: DDSchema): Record<string, unknown>
  /**
   * 将 JSON 转成 DefinitionDataSchema
   * @param json
   */
  parseDefinitionSchemaJSON(json: Record<string, unknown>): DDSchema
  /**
   * 转换成可被 JSON.stringify 的 JSON 对象
   * @param schema
   */
  toJSON(schema: DSchema): Record<string, unknown>
  /**
   * 将 JSON 转成 DataSchema
   * @param json
   */
  parseJSON(json: Record<string, any>): DSchema
}

/**
 * 数据模式的编译器
 */
export interface DataSchemaCompiler<
  T extends string,
  V,
  RDS extends RawDataSchema<T, V>,
  DS extends DataSchema<T, V>
> {
  /**
   * Corresponds to the type in RawDataSchema, used as a unique identifier,
   * indicates what type of RawDataSchema the compiler receives
   *
   * 对应 RawDataSchema 中的 type，用作唯一标识
   * 表示该编译器接收何种类型的 RawDataSchema
   */
  readonly type: T
  /**
   * 编译数据模式的原始数据
   * @param rawSchema
   */
  compile(
    rawSchema: RawDataSchema<T, V>,
  ): DataSchemaCompileResult<T, V, RDS, DS>
  /**
   * 将原始数据做格式化
   * @param rawSchema
   */
  normalizeRawSchema(rawSchema: RawDataSchema<T, V>): RawDataSchema<T, V>
  /**
   * 转换成可被 JSON.stringify 的 JSON 对象
   * @param schema
   */
  toJSON(schema: DataSchema<T, V>): Record<string, unknown>
  /**
   * 将 JSON 转成 DataSchema
   * @param json
   */
  parseJSON(json: Record<string, unknown>): DataSchema<T, V>
}

/**
 * DataSchema compiler's constructor interface
 *
 * DataSchema 编译器的构造函数接口
 */
export interface DataSchemaCompilerConstructor<
  T extends string,
  V,
  RDS extends RawDataSchema<T, V>,
  DS extends DataSchema<T, V>
> {
  /**
   * constructor of DataSchemaCompiler<T, V, RDS, DS>
   *
   * @param context   the context of DataSchemaCompiler
   */
  new (context: DataSchemaCompilerContext): DataSchemaCompiler<T, V, RDS, DS>
}
