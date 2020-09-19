import { coverBoolean } from '../../_util/cover-util'
import { DataSchema, RawDataSchema } from '../schema'
import { DataSchemaCompileResult } from './result'
import { DataSchemaCompiler, DataSchemaCompilerContext } from './types'


/**
 * DataSchema compiler to compile RawDataSchema content into DataSchema
 *
 * 数据模式编译器，将用户定义的内容编译成 DataSchema
 * @template T    typeof <X>DataSchema.type
 * @template V    typeof <X>DataSchema.V
 * @template DS   typeof <X>DataSchema
 * @template RDS  typeof <X>RawDataSchema
 */
export abstract class BaseDataSchemaCompiler<
  T extends string,
  V,
  RDS extends RawDataSchema<T, V>,
  DS extends DataSchema<T, V>>
  implements DataSchemaCompiler<T, V, RDS, DS> {
  /**
   * override member variable
   * @see DataSchemaCompiler#type
   */
  public abstract readonly type: T

  protected readonly context: DataSchemaCompilerContext

  public constructor(context: DataSchemaCompilerContext) {
    this.context = context
  }

  /**
   * override method
   * @see DataSchemaCompiler#compile
   */
  public compile(rawSchema: RawDataSchema<T, V>): DataSchemaCompileResult<T, V, RDS, DS> {
    // eslint-disable-next-line no-param-reassign
    rawSchema = this.normalizeRawSchema(rawSchema)
    const result: DataSchemaCompileResult<T, V, RDS, DS> =
      (new DataSchemaCompileResult(rawSchema)) as any

    // required 的默认值为 false
    const requiredResult = result.compileConstraint<boolean>('required', coverBoolean, false)

    const schema: DS = {
      type: rawSchema.type,
      required: Boolean(requiredResult.value),
      default: rawSchema.default,
      description: rawSchema.description,
    } as DS

    return result.setValue(schema)
  }

  /**
   * override method
   * @see DataSchemaCompiler#normalizeRawSchema
   */
  public normalizeRawSchema(rawSchema: RawDataSchema<T, V>): RawDataSchema<T, V> {
    return this.context.normalizeRawSchema(rawSchema) as RawDataSchema<T, V>
  }

  /**
   * override method
   * @see DataSchemaCompiler#toJSON
   */
  public toJSON(schema: DataSchema<T, V>): Record<string, unknown> {
    const { type, required, description } = schema
    return { type, default: schema.default, required, description }
  }

  /**
   * override method
   * @see DataSchemaCompiler#parseJSON
   */
  public parseJSON(json: Record<string, unknown>): DataSchema<T, V> {
    const { type, required, description } = json as any
    return { type, default: (json as any).default, required, description }
  }
}
