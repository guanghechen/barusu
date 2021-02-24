import {
  isString,
  toCamelCase,
  toCapitalCase,
  toConstantCase,
  toKebabCase,
  toLowerCase,
  toPascalCase,
  toSnakeCase,
  toUpperCase,
} from '@barusu/util-option'
import {
  BaseDataValidator,
  BaseDataValidatorFactory,
  DataValidationResult,
  DataValidator,
} from '../_core/validator'
import { stringify } from '../_util/string-util'
import {
  STRING_T_TYPE as T,
  STRING_V_TYPE as V,
  StringDataSchema as DS,
  StringFormat,
  StringTransformType,
} from '../schema/string'

/**
 * StringDataSchema 校验结果的数据类型
 */
export type StringDataValidationResult = DataValidationResult<T, V, DS>

/**
 * 字符串类型的校验器
 */
// eslint-disable-next-line max-len
export class StringDataValidator
  extends BaseDataValidator<T, V, DS>
  implements DataValidator<T, V, DS> {
  public readonly type: T = T

  /**
   * 包装 StringDataSchema 的实例，使其具备校验给定数据是否为合法字符串的能力
   * @param data
   */
  public validate(data: unknown): StringDataValidationResult {
    const { schema } = this
    const result: StringDataValidationResult = super.validate(data)
    let value = result.value
    result.setValue(undefined)

    // 若未设置值，则无需进一步校验
    if (value === undefined) return result

    // 执行 transform
    if (schema.transform != null && schema.transform.length > 0) {
      for (const transformType of schema.transform) {
        switch (transformType as StringTransformType) {
          case StringTransformType.TRIM:
            value = value.trim()
            break
          case StringTransformType.LOWER_CASE:
            value = toLowerCase(value)
            break
          case StringTransformType.UPPER_CASE:
            value = toUpperCase(value)
            break
          case StringTransformType.CAPITAL_CASE:
            value = toCapitalCase(value)
            break
          case StringTransformType.CAMEL_CASE:
            value = toCamelCase(value)
            break
          case StringTransformType.PASCAL_CASE:
            value = toPascalCase(value)
            break
          case StringTransformType.KEBAB_CASE:
            value = toKebabCase(value)
            break
          case StringTransformType.SNAKE_CASE:
            value = toSnakeCase(value)
            break
          case StringTransformType.CONSTANT_CASE:
            value = toConstantCase(value)
            break
        }
      }
    }

    // 检查 minLength
    if (schema.minLength != null && schema.minLength > value.length) {
      return result.addError({
        constraint: 'minLength',
        reason: `minLength expected is ${
          schema.minLength
        }, but got value (${stringify(value)}) with length (${value.length}).`,
      })
    }

    // 检查 maxLength
    if (schema.maxLength != null && schema.maxLength < value.length) {
      return result.addError({
        constraint: 'maxLength',
        reason: `maxLength expected is ${
          schema.maxLength
        }, but got value (${stringify(value)}) with length (${value.length}).`,
      })
    }

    // 检查是否匹配指定的模式
    if (schema.pattern != null && !schema.pattern.test(value)) {
      return result.addError({
        constraint: 'pattern',
        reason: `expected value pattern is (${stringify(
          schema.pattern.source,
        )}), but got (${stringify(value)}).`,
      })
    }

    // 检查 format
    if (schema.format != null && schema.format.length > 0) {
      let valid = false
      for (const format of schema.format) {
        const test = () => {
          // check if the full-date is legal
          const testFullDate = (
            year: number,
            month: number,
            day: number,
          ): boolean => {
            if (day <= 28) return true
            if (month !== 2) {
              if (day <= 30) return true
              return [1, 3, 5, 7, 8, 10, 12].indexOf(month) >= 0
            }
            if (day > 29) return false

            // check leap year for date YYYY-02-29
            return year & 3 ? false : year % 100 === 0 ? year % 400 === 0 : true
          }

          switch (format) {
            case StringFormat.IPV4: {
              // see https://stackoverflow.com/a/25969006
              const regex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
              return regex.test(value!)
            }
            case StringFormat.IPV6: {
              // see https://stackoverflow.com/a/17871737
              const regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/
              return regex.test(value!)
            }
            case StringFormat.EMAIL: {
              // see https://stackoverflow.com/a/1373724
              const regex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/
              return regex.test(value!)
            }
            case StringFormat.DATE: {
              // YYYY-MM-DD
              const regex = /^(\d{4})-(0[1-9]|1[0-2])-([0-2][1-9]|3[0-1])$/
              const match = regex.exec(value!)
              if (match == null) return false
              const year = Number.parseInt(match[1])
              const month = Number.parseInt(match[2])
              const day = Number.parseInt(match[3])
              return testFullDate(year, month, day)
            }
            case StringFormat.TIME: {
              // HH:mm:ssZ / HH:mm:ss.SZ / HH:mm:ss+HH:mm / HH:mm:ss.S+HH:mm
              // 需要考虑 闰秒 的存在
              const regex = /^([0-1][0-9]|[2][0-3]):([0-5][0-9]):([0-5][0-9]|60)(?:\.\d+)?(?:[zZ]|[+-]([0-1][0-9]|[2][0-3]):([0-5][0-9])|)$/
              const match = regex.exec(value!)
              if (match == null) return false
              return true
            }
            case StringFormat.DATE_TIME: {
              const regex = /^(\d{4})-(0[1-9]|1[0-2])-([0-2][1-9]|3[0-1])[tT]([0-1][0-9]|[2][0-3]):([0-5][0-9]):([0-5][0-9]|60)(?:\.\d+)?(?:[zZ]|[+-]([0-1][0-9]|[2][0-3]):([0-5][0-9])|)$/
              const match = regex.exec(value!)
              if (match == null) return false
              const year = Number.parseInt(match[1])
              const month = Number.parseInt(match[2])
              const day = Number.parseInt(match[3])
              return testFullDate(year, month, day)
            }
            default:
              return false
          }
        }

        // 校验通过
        if (test()) {
          valid = true
          break
        }
      }
      if (!valid) {
        const reason =
          schema.format.length > 1
            ? `not matched any format in ${stringify(schema.format)}`
            : `not matched \`${schema.format}\``
        return result.addError({
          constraint: 'format',
          reason,
        })
      }
    }

    // 检查枚举值
    if (
      schema.enum != null &&
      schema.enum.length > 0 &&
      schema.enum.indexOf(value) < 0
    ) {
      return result.addError({
        constraint: 'enum',
        reason: `expected value should in the ${stringify(
          schema.enum,
        )}, but got (${stringify(value)}).`,
      })
    }

    // 通过校验
    return result.setValue(value)
  }

  /**
   * override method
   * @see DataValidator#checkType
   */
  public checkType(data: unknown): data is V {
    return isString(data)
  }
}

/**
 * 字符串类型的校验器的工厂对象实例
 */
export class StringDataValidatorFactory extends BaseDataValidatorFactory<
  T,
  V,
  DS
> {
  public readonly type: T = T

  public create(schema: DS): StringDataValidator {
    return new StringDataValidator(schema, this.context)
  }
}
