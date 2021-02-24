import {
  BaseDataValidator,
  BaseDataValidatorFactory,
  DataValidationResult,
  DataValidator,
} from '../_core/validator'
import {
  NULL_T_TYPE as T,
  NULL_V_TYPE as V,
  NullDataSchema as DS,
} from '../schema/null'

/**
 * NullDataSchema 校验结果的数据类型
 */
export type NullDataValidationResult = DataValidationResult<T, V, DS>

/**
 * 布尔值类型的校验器
 */
// eslint-disable-next-line max-len
export class NullDataValidator
  extends BaseDataValidator<T, V, DS>
  implements DataValidator<T, V, DS> {
  public readonly type: T = T

  /**
   * 包装 NullDataSchema 的实例，使其具备校验给定数据是否为合法布尔值的能力
   * @param data
   */
  public validate(data: unknown): NullDataValidationResult {
    const result: NullDataValidationResult = super.validate(data)
    const value = result.value
    result.setValue(undefined)

    // 若未设置值，则无需进一步校验
    if (value === undefined) return result

    // 若未产生错误，则通过校验，并设置 value
    if (!result.hasError) result.setValue(value)
    return result
  }

  /**
   * override method
   * @see DataValidator#checkType
   */
  public checkType(data: unknown): data is V {
    return data === null
  }
}

/**
 * 布尔值类型的校验器的工厂对象
 */
export class NullDataValidatorFactory extends BaseDataValidatorFactory<
  T,
  V,
  DS
> {
  public readonly type: T = T

  public create(schema: DS): NullDataValidator {
    return new NullDataValidator(schema, this.context)
  }
}
