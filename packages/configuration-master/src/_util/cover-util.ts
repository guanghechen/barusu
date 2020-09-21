import { convertToNumber, isArray, isString } from '@barusu/util-option'
import { StringExceptionHandleResult } from './handle-result'
import { stringify } from './string-util'


/**
 * CoverOperationResult 实现类
 */
export type CoverOperationResult<T> = StringExceptionHandleResult<T>
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const CoverOperationResult = StringExceptionHandleResult


/**
 * 覆盖操作
 * 若传进来的值不是一个合法的值，则会将 value 置为 defaultValue（除非有特殊说明），并添加对应的错误消息
 *
 * @param defaultValue  默认值
 * @param value         传进来的值
 */
export type CoverOperationFunc<T> = (defaultValue?: T, value?: any) => CoverOperationResult<T>


/**
 * 传进来的选项覆盖默认值
 * 若传进来的值为 undefined，则返回默认值；
 * 否则将传进来的值转为 number 并返回；返回返回含错误信息的 Result 对象
 */
export const coverNumber: CoverOperationFunc<number> = (defaultValue, value) => {
  const result: CoverOperationResult<number> = new CoverOperationResult(defaultValue)
  if (value === undefined) return result
  if (typeof value !== 'number') {
    return result.addError(`expected a number, but got (${ stringify(value) }).`)
  }

  // 转为 number
  const v = convertToNumber(value)
  if (v == null || Number.isNaN(v)) {
    return result.addError(`(${ stringify(value) }) is not a valid number (or number string).`)
  }

  return result.setValue(v)
}


/**
 * 传进来的选项覆盖默认值
 * 若传进来的值为 undefined 或非数字，则返回默认值；
 * 若传进来的值为数字，但并非整数，则添加一条错误消息，并仍将此值置为返回结果中的 value
 * 否则将传进来的值转为 number 并返回
 */
export const coverInteger: CoverOperationFunc<number> = (defaultValue, value) => {
  const result: CoverOperationResult<number> = new CoverOperationResult(defaultValue)
  if (value === undefined) return result
  if (typeof value !== 'number') {
    return result.addError(`expected a integer, but got (${ stringify(value) }).`)
  }

  // 转为 number
  const v = convertToNumber(value)
  if (v == null || Number.isNaN(v)) {
    return result.addError(`(${ stringify(value) }) is not a valid integer (or integer string)`)
  }

  // 检查是否为整数
  if (!Number.isInteger(v)) {
    result.addError(`(${ stringify(value) }) is not a valid integer (or integer string)`)
  }

  return result.setValue(v)
}


/**
 * 如果是字符串，则
 *  - 'false'（不区分大小写）视作 false
 *  - 'true'（不区分大小写）视作 true
 *  - 其余值视作 undefined
 *
 * 否则，若不是布尔值，视作类型错误
 */
export const coverBoolean: CoverOperationFunc<boolean> = (defaultValue, value) => {
  const result: CoverOperationResult<boolean> = new CoverOperationResult(defaultValue)
  if (value === undefined) return result

  // 检查是否字符串
  if (isString(value)) {
    // eslint-disable-next-line no-param-reassign
    value = value.toLocaleLowerCase()
  }

  switch (value) {
    case 'false':
    case false: return result.setValue(false)
    case 'true':
    case true: return result.setValue(true)
    default:
      return result.addError(`(${ stringify(value) }) is not a valid boolean type (or boolean string)`)
  }
}


/**
 * 若传进来的值不为 null/undefined，则视为错误
 * 若为 undefined，则设置为默认值
 */
export const coverNull: CoverOperationFunc<null> = (defaultValue, value) => {
  const result: CoverOperationResult<null> = new CoverOperationResult(defaultValue)
  if (value === undefined) return result
  if (value == null) return result.setValue(value)
  return result.addError(`(${ stringify(value) }) is not a valid null type`)
}


/**
 * 传进来的选项覆盖默认值
 * 若传进来的值为 null/undefined 或空字符串，则返回默认值
 */
export const coverString: CoverOperationFunc<string> = (defaultValue, value) => {
  const result: CoverOperationResult<string> = new CoverOperationResult(defaultValue)
  if (value === undefined) return result

  // 检查是否为字符串
  if (!isString(value)) {
    return result.addError(`(${ stringify(value) }) is not a valid string`)
  }

  return result.setValue(value)
}


/**
 * 若传进来的值不是一个合法的正则表达式字符串，则会将 value 置为 defaultValue，
 * 并添加对应的错误信息
 */
export const coverRegex: CoverOperationFunc<RegExp> = (defaultValue, value) => {
  const result: CoverOperationResult<RegExp> = new CoverOperationResult(defaultValue)
  if (value === undefined) return result

  try {
    const regex = new RegExp(value)
    result.setValue(regex)
  } catch (error) {
    result.addError(error.message || `(${ stringify(value) }) is not a valid regex.`)
  }

  return result
}


/**
 * 覆盖数组的数据选项
 * @param elemCoverFunc   针对每个元素做覆盖操作的函数
 */
export function coverArray<T>(elemCoverFunc: CoverOperationFunc<T>): CoverOperationFunc<T[]> {
  return (defaultValue?: T[], value?: any): CoverOperationResult<T[]> => {
    const result: CoverOperationResult<T[]> = new CoverOperationResult(defaultValue)
    if (value === undefined) return result

    // 如果不是数组，则直接置为默认值，并添加错误信息
    if (!isArray(value)) {
      return result.addError(`${ stringify(value) } is not a valid array`)
    }

    const resolvedValue: T[] = []
    for (let i = 0; i < value.length; ++i) {
      const v = value[i]
      const xResult = elemCoverFunc(undefined, v)
      resolvedValue.push(xResult.value!)

      // 忽略错误的值
      if (xResult.hasError) {
        result.addError(`index(${ i }): ` + xResult.errorSummary)
      }
    }

    // 如果没有碰到错误，则将 resolvedValue 置为 result 的有效值
    if (!result.hasError) result.setValue(resolvedValue)
    return result
  }
}
