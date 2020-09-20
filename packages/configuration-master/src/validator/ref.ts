import {
  BaseDataValidator,
  BaseDataValidatorFactory,
  DataValidationResult,
  DataValidator,
} from '../_core/validator'
import {
  REF_T_TYPE as T,
  REF_V_TYPE as V,
  RefDataSchema as DS,
} from '../schema/ref'


/**
 * RefDataSchema 校验结果的数据类型
 */
export type RefDataValidationResult = DataValidationResult<T, V, DS>


/**
 * 布尔值类型的校验器
 */
// eslint-disable-next-line max-len
export class RefDataValidator extends BaseDataValidator<T, V, DS> implements DataValidator<T, V, DS> {
  public readonly type: T = T

  /**
   * 包装 RefDataSchema 的实例，使其具备校验给定数据是否为合法布尔值的能力
   * @param data
   */
  public validate(data: any): RefDataValidationResult {
    const result: RefDataValidationResult = super.validate(data)
    const value = result.value
    result.setValue(undefined)

    // 若未设置值或已存在校验错误，则无需进一步校验
    if (value === undefined) return result

    const { $ref } = this.schema
    const xSchema = this.context.getDefinition($ref)
    if (xSchema == null) {
      return result.addError({
        constraint: '$ref',
        reason: `not found DataSchema with $id(${ $ref })`
      })
    }

    const xResult = this.context.validateDataSchema(xSchema, value)
    const warnings = xResult.warnings.filter(
      w => w.constraint !== 'required' && w.constraint !== 'default')
    result.addWarning(...warnings)

    // required 和 default 另取
    if (xResult.hasError) {
      const errors = xResult.errors.filter(
        e => e.constraint !== 'required' && e.constraint !== 'default')
      if (errors.length > 0) {
        return result.addError(...errors)
      }
    }

    return result.setValue(xResult.value)
  }
}


/**
 * 布尔值类型的校验器的工厂对象
 */
export class RefDataValidatorFactory extends BaseDataValidatorFactory<T, V, DS> {
  public readonly type: T = T

  public create(schema: DS) {
    return new RefDataValidator(schema, this.context)
  }
}
