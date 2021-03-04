import { isArray } from '@guanghechen/option-helper'
import {
  BaseDataValidator,
  BaseDataValidatorFactory,
  DVResult,
  DataValidationResult,
  DataValidator,
} from '../_core/validator'
import { stringify } from '../_util/string-util'
import {
  ARRAY_T_TYPE as T,
  ARRAY_V_TYPE as V,
  ArrayDataSchema as DS,
} from '../schema/array'

/**
 * ArrayDataSchema 校验结果的数据类型
 */
export type ArrayDataValidationResult = DataValidationResult<T, V, DS>

/**
 * 数组类型的校验器
 */
// eslint-disable-next-line max-len
export class ArrayDataValidator
  extends BaseDataValidator<T, V, DS>
  implements DataValidator<T, V, DS> {
  public readonly type: T = T

  /**
   * 包装 ArrayDataSchema 的实例，使其具备校验给定数据是否为合法数组的能力
   * @param data
   */
  public validate(data: unknown): ArrayDataValidationResult {
    const { schema } = this
    const result: ArrayDataValidationResult = super.validate(data)
    const value = result.value
    result.setValue(undefined)

    // 若未设置值，则无需进一步校验
    if (value === undefined) return result

    // 检查是否唯一
    if (schema.unique) {
      const valueSet = new Set(value)
      if (valueSet.size !== value.length) {
        return result.addError({
          constraint: 'unique',
          reason: `expected a unique array, but got (${stringify(value)}).`,
        })
      }
    }

    // 检查数据项是否符合 items 的定义
    if (schema.items != null) {
      const newValues = []
      for (let i = 0; i < value.length; ++i) {
        const d = value[i]
        const xValidateResult: DVResult = this.context.validateDataSchema(
          schema.items,
          d,
        )
        result.addHandleResult('items', xValidateResult, '' + i)
        if (!xValidateResult.hasError) {
          newValues.push(xValidateResult.value)
        }
      }
      value.splice(0, value.length, ...newValues)
    }

    // 如果存在错误，则不能设置值
    if (result.hasError) return result

    // 通过校验
    return result.setValue(value)
  }

  /**
   * override method
   * @see DataValidator#checkType
   */
  public checkType(data: unknown): data is V {
    return isArray(data)
  }
}

/**
 * 数组类型的校验器的工厂对象
 */
export class ArrayDataValidatorFactory extends BaseDataValidatorFactory<
  T,
  V,
  DS
> {
  public readonly type: T = T

  public create(schema: DS): ArrayDataValidator {
    return new ArrayDataValidator(schema, this.context)
  }
}
