import { isArray } from '@barusu/util-option'
import {
  BaseDataSchemaCompiler,
  DataSchemaCompileResult,
  DataSchemaCompiler,
} from '../_core/compiler'
import { coverBoolean } from '../_util/cover-util'
import { stringify } from '../_util/string-util'
import {
  ARRAY_T_TYPE as T,
  ARRAY_V_TYPE as V,
  ArrayDataSchema as DS,
  RawArrayDataSchema as RDS,
} from '../schema/array'

/**
 * ArrayDataSchema 编译结果的数据类型
 */
export type ArrayDataSchemaCompileResult = DataSchemaCompileResult<
  T,
  V,
  RDS,
  DS
>

/**
 * 数组类型的模式的编译器
 *
 * enum 将忽略所有非数组的值
 */
export class ArrayDataSchemaCompiler
  extends BaseDataSchemaCompiler<T, V, RDS, DS>
  implements DataSchemaCompiler<T, V, RDS, DS> {
  public readonly type: T = T

  /**
   * compile RawSchema to Schema
   * @param rawSchema
   */
  public compile(rawSchema: RDS): ArrayDataSchemaCompileResult {
    const result: ArrayDataSchemaCompileResult = super.compile(rawSchema)
    // eslint-disable-next-line no-param-reassign
    rawSchema = result._rawSchema

    // unique 的默认值为 false
    const uniqueResult = result.compileConstraint<boolean>(
      'unique',
      coverBoolean,
      false,
    )

    // 检查 defaultValue 是否为数组
    let defaultValue = undefined
    if (rawSchema.default !== undefined) {
      if (!isArray(rawSchema.default)) {
        result.addError({
          constraint: 'default',
          reason: `expected an array, but got (${stringify(
            rawSchema.default,
          )}).`,
        })
      } else {
        defaultValue = rawSchema.default
      }
    }

    // items 为可选项
    let items: DS['items']
    if (rawSchema.items !== undefined) {
      // 编译 items
      const itemsResult = this.context.compileDataSchema(rawSchema.items)
      result.addHandleResult('items', itemsResult)
      items = itemsResult.value
    }

    // ArrayDataSchema
    const schema: DS = {
      ...result.value!,
      default: defaultValue,
      items,
      unique: Boolean(uniqueResult.value),
    }

    return result.setValue(schema)
  }

  /**
   * override method
   * @see DataSchemaCompiler#toJSON
   */
  public toJSON(schema: DS): Record<string, unknown> {
    const json: any = super.toJSON(schema)
    json.unique = schema.unique
    if (schema.items != null) json.items = this.context.toJSON(schema.items)
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
      unique: json.unique,
    }

    // parse items of ArrayDataSchema
    if (json.items !== null) {
      schema.items = this.context.parseJSON(json.items)
    }

    return schema
  }
}
