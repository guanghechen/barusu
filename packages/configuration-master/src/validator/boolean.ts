import { isBoolean } from '@barusu/util-option'
import {
  BaseDataValidator,
  BaseDataValidatorFactory,
  DataValidationResult,
  DataValidator,
} from '../_core/validator'
import { coverBoolean } from '../_util/cover-util'
import {
  BOOLEAN_T_TYPE as T,
  BOOLEAN_V_TYPE as V,
  BooleanDataSchema as DS,
} from '../schema/boolean'


/**
 * BooleanDataSchema 校验结果的数据类型
 */
export type BooleanDataValidationResult = DataValidationResult<T, V, DS>


/**
 * 布尔值类型的校验器
 */
// eslint-disable-next-line max-len
export class BooleanDataValidator extends BaseDataValidator<T, V, DS> implements DataValidator<T, V, DS> {
  public readonly type: T = T

  /**
   * 包装 BooleanDataSchema 的实例，使其具备校验给定数据是否为合法布尔值的能力
   * @param data
   */
  public validate(data: unknown): BooleanDataValidationResult {
    const result: BooleanDataValidationResult = super.validate(data)
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
    return isBoolean(data)
  }

  /**
   * override method
   * @see DataValidator#preprocessData
   */
  public preprocessData(data: unknown): V | undefined {
    const xResult = coverBoolean(undefined, data)
    return xResult.value === undefined ? (data as V) : xResult.value;
  }
}


/**
 * 布尔值类型的校验器的工厂对象
 */
export class BooleanDataValidatorFactory extends BaseDataValidatorFactory<T, V, DS> {
  public readonly type: T = T

  public create(schema: DS): BooleanDataValidator {
    return new BooleanDataValidator(schema, this.context)
  }
}
