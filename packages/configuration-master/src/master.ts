import {
  DSCResult,
  DSCompilerConstructor,
  DataSchemaCompilerMaster,
} from './_core/compiler'
import { DSchema, RDSchema } from './_core/schema'
import {
  DVFactoryConstructor,
  DVResult,
  DataValidatorMaster,
} from './_core/validator'
import { ArrayDataSchemaCompiler } from './compiler/array'
import { BooleanDataSchemaCompiler } from './compiler/boolean'
import { CombineDataSchemaCompiler } from './compiler/combine'
import { IntegerDataSchemaCompiler } from './compiler/integer'
import { NullDataSchemaCompiler } from './compiler/null'
import { NumberDataSchemaCompiler } from './compiler/number'
import { ObjectDataSchemaCompiler } from './compiler/object'
import { RefDataSchemaCompiler } from './compiler/ref'
import { StringDataSchemaCompiler } from './compiler/string'
import { ARRAY_T_TYPE } from './schema/array'
import { BOOLEAN_T_TYPE } from './schema/boolean'
import { COMBINE_T_TYPE } from './schema/combine'
import { INTEGER_T_TYPE } from './schema/integer'
import { NULL_T_TYPE } from './schema/null'
import { NUMBER_T_TYPE } from './schema/number'
import { OBJECT_T_TYPE } from './schema/object'
import { REF_T_TYPE } from './schema/ref'
import { STRING_T_TYPE } from './schema/string'
import { ArrayDataValidatorFactory } from './validator/array'
import { BooleanDataValidatorFactory } from './validator/boolean'
import { CombineDataValidatorFactory } from './validator/combine'
import { IntegerDataValidatorFactory } from './validator/integer'
import { NullDataValidatorFactory } from './validator/null'
import { NumberDataValidatorFactory } from './validator/number'
import { ObjectDataValidatorFactory } from './validator/object'
import { RefDataValidatorFactory } from './validator/ref'
import { StringDataValidatorFactory } from './validator/string'

/**
 * Management object for parsing data schema and verifying data
 *
 * 编译数据模式、校验数据的管理对象
 */
export class ConfigurationMaster {
  /**
   * 数据模式编译器管理对象实例
   */
  protected readonly schemaCompilerMaster: DataSchemaCompilerMaster

  /**
   * 数据校验器管理对象实例
   */
  protected readonly dataValidatorMaster: DataValidatorMaster

  public constructor() {
    this.schemaCompilerMaster = new DataSchemaCompilerMaster()
    this.dataValidatorMaster = new DataValidatorMaster()
  }

  /**
   * Add DataSchemaCompiler, if the compiler of the specified type
   * already exists, ignore this addition
   *
   * 添加 DataSchemaCompiler，若指定的 type 的编译器已存在，则忽略此次添加
   * @param type
   * @param SchemaCompilerConstructor
   */
  public registerCompiler(
    type: string,
    SchemaCompilerConstructor: DSCompilerConstructor,
  ): this {
    const schemaCompiler = new SchemaCompilerConstructor(
      this.schemaCompilerMaster,
    )
    this.schemaCompilerMaster.registerCompiler(type, schemaCompiler)
    return this
  }

  /**
   * Overwrite the existing DataSchemaCompiler. If there is no corresponding
   * DataSchemaCompiler before the specified type, then add it.
   *
   * 覆盖已有的 DataSchemaCompiler；
   * 若指定的 type 之前没有对应的 DataSchemaCompiler，也做添加操作
   * @param type
   * @param SchemaCompilerConstructor
   */
  public replaceCompiler(
    type: string,
    SchemaCompilerConstructor: DSCompilerConstructor,
  ): this {
    const schemaCompiler = new SchemaCompilerConstructor(
      this.schemaCompilerMaster,
    )
    this.schemaCompilerMaster.replaceCompiler(type, schemaCompiler)
    return this
  }

  /**
   * Add DataValidatorFactory, if the specified type already exists,
   * ignore this addition
   *
   * 添加 DataValidatorFactory，若指定的 type 已存在，则忽略此次添
   * @param type
   * @param DataValidatorFactoryConstructor
   */
  public registerValidatorFactory(
    type: string,
    DataValidatorFactoryConstructor: DVFactoryConstructor,
  ): this {
    const dataValidatorFactory = new DataValidatorFactoryConstructor(
      this.dataValidatorMaster,
    )
    this.dataValidatorMaster.registerValidatorFactory(
      type,
      dataValidatorFactory,
    )
    return this
  }

  /**
   * Overwrite the existing DataValidatorFactory. If there is no
   * corresponding DataValidatorFactory before the specified type, then add it
   *
   * 覆盖已有的 DataValidatorFactory，若指定的 type 之前没有对应的 DataValidatorFactory，也做添加操作
   * @param type
   * @param DataValidatorFactoryConstructor
   */
  public replaceValidatorFactory(
    type: string,
    DataValidatorFactoryConstructor: DVFactoryConstructor,
  ): this {
    const dataValidatorFactory = new DataValidatorFactoryConstructor(
      this.dataValidatorMaster,
    )
    this.dataValidatorMaster.replaceValidatorFactory(type, dataValidatorFactory)
    return this
  }

  /**
   * 执行编译操作
   * @param rawDataSchema   待编译的 RawDataSchema
   */
  public compile(rawDataSchema: RDSchema): DSCResult {
    return this.schemaCompilerMaster.compileTopDataSchema(rawDataSchema)
  }

  /**
   * 执行校验操作
   * @param schema  预期的数据模式
   * @param data    待校验的数据a
   */
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public validate(schema: DSchema, data: any): DVResult {
    return this.dataValidatorMaster.validateTopDataSchema(schema, data)
  }

  /**
   * 转换成可被 JSON.stringify 的 JSON 对象
   * @param schema
   */
  public toJSON(schema: DSchema): Record<string, unknown> {
    return this.schemaCompilerMaster.topSchemaToJSON(schema)
  }

  /**
   * 将 JSON 转成 DataSchema
   * @param json
   */
  public parseJSON(json: Record<string, any>): DSchema {
    return this.schemaCompilerMaster.parseTopSchemaJSON(json)
  }

  /**
   * Register the preset DataSchema, its compiler, and validator into the
   * current ConfigurationMaster instance
   *
   * 将预置的 DataSchema 及其编译器、校验器注册进当前 ConfigurationMaster 实例中
   */
  public registerDefaultSchemas(): this {
    this
      // array
      .registerCompiler(ARRAY_T_TYPE, ArrayDataSchemaCompiler)
      .registerValidatorFactory(ARRAY_T_TYPE, ArrayDataValidatorFactory)

      // boolean
      .registerCompiler(BOOLEAN_T_TYPE, BooleanDataSchemaCompiler)
      .registerValidatorFactory(BOOLEAN_T_TYPE, BooleanDataValidatorFactory)

      // combine
      .registerCompiler(COMBINE_T_TYPE, CombineDataSchemaCompiler)
      .registerValidatorFactory(COMBINE_T_TYPE, CombineDataValidatorFactory)

      // integer
      .registerCompiler(INTEGER_T_TYPE, IntegerDataSchemaCompiler)
      .registerValidatorFactory(INTEGER_T_TYPE, IntegerDataValidatorFactory)

      // null
      .registerCompiler(NULL_T_TYPE, NullDataSchemaCompiler)
      .registerValidatorFactory(NULL_T_TYPE, NullDataValidatorFactory)

      // number
      .registerCompiler(NUMBER_T_TYPE, NumberDataSchemaCompiler)
      .registerValidatorFactory(NUMBER_T_TYPE, NumberDataValidatorFactory)

      // object
      .registerCompiler(OBJECT_T_TYPE, ObjectDataSchemaCompiler)
      .registerValidatorFactory(OBJECT_T_TYPE, ObjectDataValidatorFactory)

      // ref
      .registerCompiler(REF_T_TYPE, RefDataSchemaCompiler)
      .registerValidatorFactory(REF_T_TYPE, RefDataValidatorFactory)

      // string
      .registerCompiler(STRING_T_TYPE, StringDataSchemaCompiler)
      .registerValidatorFactory(STRING_T_TYPE, StringDataValidatorFactory)
    return this
  }
}

/**
 * 默认的 CompilerMaster；
 * 支持类型包括：array, boolean, combine, integer, number, object, ref, string
 */
export const configurationMaster = new ConfigurationMaster()
configurationMaster.registerDefaultSchemas()
