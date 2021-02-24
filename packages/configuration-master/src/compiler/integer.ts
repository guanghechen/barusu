import {
  BaseDataSchemaCompiler,
  DataSchemaCompileResult,
  DataSchemaCompiler,
} from '../_core/compiler'
import { coverArray, coverInteger } from '../_util/cover-util'
import {
  INTEGER_T_TYPE as T,
  INTEGER_V_TYPE as V,
  IntegerDataSchema as DS,
  RawIntegerDataSchema as RDS,
} from '../schema/integer'


/**
 * IntegerDataSchema 编译结果的数据类型
 */
export type IntegerDataSchemaCompileResult = DataSchemaCompileResult<T, V, RDS, DS>


/**
 * 数字类型的模式的编译器
 *
 * minimum 和 exclusiveMaximum 若非整数，则做上取整
 * maximum 和 exclusiveMinimum 若非整数，则做下取整
 * enum 将忽略所有非整数（或整数字符串）的值
 */
export class IntegerDataSchemaCompiler
  extends BaseDataSchemaCompiler<T, V, RDS, DS>
  implements DataSchemaCompiler<T, V, RDS, DS> {

  public readonly type: T = T

  /**
   * compile RawSchema to Schema
   * @param rawSchema
   */
  public compile(rawSchema: RDS): IntegerDataSchemaCompileResult {
    const result: IntegerDataSchemaCompileResult = super.compile(rawSchema)
    // eslint-disable-next-line no-param-reassign
    rawSchema = result._rawSchema

    const defaultValueResult = result.compileConstraint<V>(
      'default', coverInteger)
    const minimumResult = result.compileConstraint<number>(
      'minimum', coverInteger)
    const maximumResult = result.compileConstraint<number>(
      'maximum', coverInteger)
    const exclusiveMinimumResult = result.compileConstraint<number>(
      'exclusiveMinimum', coverInteger)
    const exclusiveMaximumResult = result.compileConstraint<number>(
      'exclusiveMaximum', coverInteger)
    const enumValueResult = result.compileConstraint<number[]>(
      'enum', coverArray<number>(coverInteger))

    const ceil = (x?: number) => x == null ? x : Math.ceil(x)
    const floor = (x?: number) => x == null ? x : Math.floor(x)

    // IntegerDataSchema
    const schema: DS = {
      ...result.value!,
      default: defaultValueResult.value,
      minimum: ceil(minimumResult.value),
      maximum: floor(maximumResult.value),
      exclusiveMinimum: floor(exclusiveMinimumResult.value),
      exclusiveMaximum: ceil(exclusiveMaximumResult.value),
      enum: enumValueResult.value,
    }

    return result.setValue(schema)
  }

  /**
   * override method
   * @see DataSchemaCompiler#toJSON
   */
  public toJSON(schema: DS): Record<string, unknown> {
    const json: any = {
      ...super.toJSON(schema),
      minimum: schema.minimum,
      maximum: schema.maximum,
      exclusiveMaximum: schema.exclusiveMaximum,
      exclusiveMinimum: schema.exclusiveMinimum,
      enum: schema.enum,
    }
    return json
  }

  /**
   * override method
   * @see DataSchemaCompiler#parseJSON
   */
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public parseJSON(json: any): DS {
    const schema: DS = {
      ...super.parseJSON(json),
      minimum: json.minimum,
      maximum: json.maximum,
      exclusiveMaximum: json.exclusiveMaximum,
      exclusiveMinimum: json.exclusiveMinimum,
      enum: json.enum,
    }
    return schema
  }
}
