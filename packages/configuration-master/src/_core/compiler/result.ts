import {
  CoverOperationFunc,
  CoverOperationResult,
} from '../../_util/cover-util'
import { DataHandleResult } from '../../_util/handle-result'
import { DataSchema, RawDataSchema } from '../schema'


/**
 * DataSchema 的编译结果
 * 当 errors 为空数组时，schema 应不为 undefined
 *
 * @template T    typeof <X>DataSchema.type
 * @template V    typeof <X>DataSchema.V
 * @template DS   typeof <X>DataSchema
 * @template RDS  typeof <X>RawDataSchema
 */
export class DataSchemaCompileResult<
  T extends string,
  V,
  RDS extends RawDataSchema<T, V>,
  DS extends DataSchema<T, V>>
  extends DataHandleResult<DS> {

  public readonly _rawSchema: RDS

  /**
   * @param rawSchema 待编译的 RawDataSchema
   */
  public constructor(rawSchema: RDS) {
    super()
    this._rawSchema = rawSchema
  }

  /**
   * 编译给定 RawDataSchema 中的属性的值
   *
   * @param constraintName  RawDataSchema 中定义的约束项的名称
   * @param coverFunc       覆盖属性的函数
   * @param defaultValue    属性的默认值
   * @template P  typeof rawSchema[propertyName]
   */
  public compileConstraint<P>(
    constraintName: keyof RDS,
    coverFunc: CoverOperationFunc<P>,
    defaultValue?: P
  ): CoverOperationResult<P> {
    const rawSchema = this._rawSchema
    const result = coverFunc(defaultValue, rawSchema[constraintName])
    if (result.hasError) {
      this.addError({
        constraint: constraintName as string,
        reason:     result.errorSummary,
      })
    }
    return result
  }
}
