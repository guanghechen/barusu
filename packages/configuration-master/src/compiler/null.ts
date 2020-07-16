import {
  BaseDataSchemaCompiler,
  DataSchemaCompileResult,
  DataSchemaCompiler,
} from '../_core/compiler'
import { coverNull } from '../_util/cover-util'
import {
  NULL_T_TYPE as T,
  NULL_V_TYPE as V,
  NullDataSchema as DS,
  RawNullDataSchema as RDS,
} from '../schema/null'


/**
 * NullDataSchema 编译结果的数据类型
 */
export type NullDataSchemaCompileResult = DataSchemaCompileResult<T, V, RDS, DS>


/**
 * 布尔类型的模式的编译器
 */
export class NullDataSchemaCompiler
  extends BaseDataSchemaCompiler<T, V, RDS, DS>
  implements DataSchemaCompiler<T, V, RDS, DS> {

  public readonly type: T = T

  /**
   * compile RawSchema to Schema
   * @param rawSchema
   */
  public compile (rawSchema: RDS): NullDataSchemaCompileResult {
    const result: NullDataSchemaCompileResult = super.compile(rawSchema)
    // eslint-disable-next-line no-param-reassign
    rawSchema = result._rawSchema

    const defaultValueResult = result.compileConstraint<V>('default', coverNull)

    // NullDataSchema
    const schema: DS = {
      ...result.value!,
      default: defaultValueResult.value,
    }

    return result.setValue(schema)
  }
}
