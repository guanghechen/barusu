import {
  BaseDataSchemaCompiler,
  DataSchemaCompileResult,
  DataSchemaCompiler,
} from '../_core/compiler'
import { coverArray, coverNumber } from '../_util/cover-util'
import {
  NUMBER_T_TYPE as T,
  NUMBER_V_TYPE as V,
  NumberDataSchema as DS,
  RawNumberDataSchema as RDS,
} from '../schema/number'

/**
 * NumberDataSchema 编译结果的数据类型
 */
export type NumberDataSchemaCompileResult = DataSchemaCompileResult<
  T,
  V,
  RDS,
  DS
>

/**
 * 数字类型的模式的编译器
 *
 * enum 将忽略所有非数字（或数字字符串）的值
 */
export class NumberDataSchemaCompiler
  extends BaseDataSchemaCompiler<T, V, RDS, DS>
  implements DataSchemaCompiler<T, V, RDS, DS> {
  public readonly type: T = T

  /**
   * compile RawSchema to Schema
   * @param rawSchema
   */
  public compile(rawSchema: RDS): NumberDataSchemaCompileResult {
    const result: NumberDataSchemaCompileResult = super.compile(rawSchema)
    // eslint-disable-next-line no-param-reassign
    rawSchema = result._rawSchema

    // required 的默认值为 false
    const defaultValueResult = result.compileConstraint<V>(
      'default',
      coverNumber,
    )
    const minimumResult = result.compileConstraint<number>(
      'minimum',
      coverNumber,
    )
    const maximumResult = result.compileConstraint<number>(
      'maximum',
      coverNumber,
    )
    const exclusiveMinimumResult = result.compileConstraint<number>(
      'exclusiveMinimum',
      coverNumber,
    )
    const exclusiveMaximumResult = result.compileConstraint<number>(
      'exclusiveMaximum',
      coverNumber,
    )
    const enumValueResult = result.compileConstraint<number[]>(
      'enum',
      coverArray<number>(coverNumber),
    )

    // NumberDataSchema
    const schema: DS = {
      ...result.value!,
      default: defaultValueResult.value,
      minimum: minimumResult.value,
      maximum: maximumResult.value,
      exclusiveMinimum: exclusiveMinimumResult.value,
      exclusiveMaximum: exclusiveMaximumResult.value,
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
