import {
  BaseDataValidator,
  BaseDataValidatorFactory,
  DVResult,
  DataValidationResult,
  DataValidator,
} from '../_core/validator'
import { stringify } from '../_util/string-util'
import {
  COMBINE_T_TYPE as T,
  COMBINE_V_TYPE as V,
  CombineDataSchema as DS,
  CombineStrategy,
} from '../schema/combine'


/**
 * CombineDataSchema 校验结果的数据类型
 */
export type CombineDataValidationResult = DataValidationResult<T, V, DS>


/**
 * 组合类型的校验器
 *
 * anyOf 取第一个校验通过的 Schema 的 value
 */
export class CombineDataValidator extends BaseDataValidator<T, V, DS> implements DataValidator<T, V, DS> {
  public readonly type: T = T

  /**
   * 包装 CombineDataSchema 的实例，使其具备校验给定数据是否为合法组合的能力
   * @param data
   */
  public validate(data: any): CombineDataValidationResult {
    const { schema } = this
    const { strategy, allOf, anyOf, oneOf } = schema
    const result: CombineDataValidationResult = super.validate(data)
    // eslint-disable-next-line no-param-reassign
    data = result.value
    result.setValue(undefined)

    // 若未设置值，则无需进一步校验
    if (data === undefined) return result

    const checkedItems: ('allOf' | 'anyOf' | 'oneOf')[] = []     // 检查的项
    const verifiedItems: ('allOf' | 'anyOf' | 'oneOf')[] = []    // 通过校验的项

    let allOfResult: DVResult | undefined = undefined  // allOf 的校验结果
    let anyOfResult: DVResult | undefined = undefined  // oneOf 的校验结果
    let oneOfResult: DVResult | undefined = undefined  // anyOf 的校验结果

    // 检查是否要判断 allOf
    if (allOf != null && allOf.length > 0) {
      checkedItems.push('allOf')
      allOfResult = new DataValidationResult(schema)
      const traceResult = new DataValidationResult(schema)
      for (let i = 0, value = data; i < allOf.length; ++i) {
        const xSchema = allOf[i]
        const xValidateResult = this.context.validateDataSchema(xSchema, value)
        traceResult.addHandleResult(`[${ i }]`, xValidateResult)
        if (xValidateResult.hasError) continue

        // 如果没有错误，则更新 value，
        // 因为若是 allOf 全通过的话，value 值应都相同
        value = xValidateResult.value
        traceResult.setValue(value)
      }

      // 检查是否存在错误
      if (!traceResult.hasError) {
        // 即使不存在错误，也要合并警告信息
        verifiedItems.push('allOf')
        allOfResult
          .addHandleResult('allOf', traceResult)
          .setValue(traceResult.value)
      } else {
        // 存在错误，需要合并错误信息
        const reason = 'not matched all of DataSchemas defined in `allOf`'
        allOfResult.addHandleResult('allOf', traceResult, undefined, reason)
      }
    }

    // 检查是否要判断 anyOf
    if (anyOf != null && anyOf.length > 0) {
      checkedItems.push('anyOf')
      anyOfResult = new DataValidationResult(schema)
      const traceResult = new DataValidationResult(schema)
      for (let i = 0; i < anyOf.length; ++i) {
        const xSchema = anyOf[i]
        const xValidateResult = this.context.validateDataSchema(xSchema, data)
        traceResult.addHandleResult(`[${ i }]`, xValidateResult)

        // anyOf 不需要符合每一项模式，不符合则继续匹配
        // 因此仅在匹配到时才添加 `warning`
        if (xValidateResult.hasError) continue

        // 通过校验，不过仍要合并可能的 warning
        const tmpResult = new DataValidationResult(schema)
        tmpResult.addHandleResult(`[${ i }]`, xValidateResult)
        verifiedItems.push('anyOf')
        anyOfResult
          .addHandleResult('anyOf', tmpResult)
          .setValue(xValidateResult.value)
        break
      }

      // 检查是否存在错误，若存在错误，需要合并错误信息
      if (!verifiedItems.includes('anyOf')) {
        const reason = 'not matched any of DataSchemas defined in `anyOf`'
        anyOfResult.addHandleResult('anyOf', traceResult, undefined, reason)
      }
    }

    // 检查是否要判断 oneOf
    if (oneOf != null && oneOf.length > 0) {
      let count = 0
      checkedItems.push('oneOf')
      oneOfResult = new DataValidationResult(schema)
      const traceResult = new DataValidationResult(schema)
      for (let i = 0; i < oneOf.length; ++i) {
        const xSchema = oneOf[i]
        const xValidateResult = this.context.validateDataSchema(xSchema, data)
        traceResult.addHandleResult(`[${ i }]`, xValidateResult)

        // oneOf 需要匹配每一项模式，不符合则继续匹配
        // 因此仅在匹配到时才添加 `warning`
        if (xValidateResult.hasError) continue

        // 通过校验
        if (count === 0) {
          // 此有当 count == 0 时才有必要合并 warning，因为 count > 0 时是 oneOf 校验失败的情况
          const tmpResult = new DataValidationResult(schema)
          tmpResult.addHandleResult(`[${ i }]`, xValidateResult)
          oneOfResult
            .addHandleResult('oneOf', tmpResult)
            .setValue(xValidateResult.value)
        }
        ++count
      }

      // 检查是否存在错误，若存在错误，需要合并错误信息
      if (count === 1) {
        verifiedItems.push('oneOf')
      } else {
        // 先清空警告信息，不然会重复
        while (oneOfResult.hasWarning) oneOfResult.warnings.pop()
        const reason = `expected matched only one of the DataSchemas defined in \`oneOf\`, but matched ${ count } DataSchemas`

        // 有可能 oneOf 中所有项都匹配，以至 traceResult 中既无错误项已无警告项
        if (traceResult.hasError) oneOfResult.addHandleResult('oneOf', traceResult, undefined, reason)
        else {
          oneOfResult.addHandleResult('oneOf', traceResult, undefined)
          oneOfResult.addError({ constraint: 'oneOf', reason })
        }
      }
    }

    let valid = false
    let reason = ''
    if (checkedItems.length > 1) {
      switch (strategy) {
        case CombineStrategy.ALL:
          valid = verifiedItems.length === checkedItems.length
          if (!valid) reason = `not matched all of ${ stringify(checkedItems) }`
          break
        case CombineStrategy.ANY:
          valid = verifiedItems.length > 0
          if (!valid) reason = `not matched any of ${ stringify(checkedItems) }`
          break
        case CombineStrategy.ONE:
          valid = verifiedItems.length === 1
          if (!valid) reason = `expected matched oneOf ${ stringify(checkedItems) }, but matched ${ stringify(verifiedItems) } of them`
          break
      }
    } else {
      // 只有一项的话，则三种策略的结果一致
      valid = verifiedItems.length === 1
    }

    if (!valid) {
      if (allOfResult != null) result.merge(allOfResult)
      if (anyOfResult != null) result.merge(anyOfResult)
      if (oneOfResult != null) result.merge(oneOfResult)

      // 如果检查了多项，那么 strategy 校验结果也要记录
      if (checkedItems.length > 1) {
        result.addError({ constraint: 'strategy', reason })
      }
    } else {
      // 若校验通过，则需合并所有通过的项的 warning
      if (allOfResult != null && !allOfResult.hasError) {
        result
          .addWarning(...allOfResult.warnings)
          .setValue(allOfResult.value)
      }
      if (anyOfResult != null && !anyOfResult.hasError) {
        result
          .addWarning(...anyOfResult.warnings)
          .setValue(anyOfResult.value)
      }
      if (oneOfResult != null && !oneOfResult.hasError) {
        result
          .addWarning(...oneOfResult.warnings)
          .setValue(oneOfResult.value)
      }
    }
    return result
  }
}


/**
 * 组合类型的校验器的工厂对象实例
 */

export class CombineDataValidatorFactory extends BaseDataValidatorFactory<T, V, DS> {
  public readonly type: T = T

  public create(schema: DS) {
    return new CombineDataValidator(schema, this.context)
  }
}
