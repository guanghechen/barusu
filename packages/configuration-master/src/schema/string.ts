import { DataSchema, RawDataSchema } from '../_core/schema'


// IntegerDataSchema.type 的类型
export const STRING_T_TYPE = 'string'
export type STRING_T_TYPE = typeof STRING_T_TYPE

// IntegerDataSchema.value 的类型
export type STRING_V_TYPE = string


/**
 * 特定类型的字符串格式
 */
export enum StringFormat {
  /**
   * ipv4 地址
   */
  IPV4 = 'ipv4',
  /**
   * ipv6 地址
   */
  IPV6 = 'ipv6',
  /**
   * 邮件格式
   */
  EMAIL = 'email',
  /**
   * 日期格式 (full-date)，形如 `YYYY-MM-DD`
   * @see https://tools.ietf.org/html/rfc3339#section-5.6
   * @see https://json-schema.org/draft/2019-09/json-schema-validation.html#rfc.section.7.3.1
   */
  DATE = 'date',
  /**
   * 时间格式 (full-time)，形如 `HH:mm:ssZ / HH:mm:ss.SZ / HH:mm:ss+HH:mm / HH:mm:ss.S+HH:mm`
   * @see https://tools.ietf.org/html/rfc3339#section-5.6
   * @see https://json-schema.org/draft/2019-09/json-schema-validation.html#rfc.section.7.3.1
   */
  TIME = 'time',
  /**
   * 时间日期格式，形如 `<date>T<time>`
   * @see https://tools.ietf.org/html/rfc3339#section-5.6
   * @see https://json-schema.org/draft/2019-09/json-schema-validation.html#rfc.section.7.3.1
   */
  DATE_TIME = 'date-time',
}

// StringFormat 集合
export const StringFormatSet = new Set<string>(Object.values(StringFormat))


/**
 * 字符串数据的转换方式
 */
export enum StringTransformType {
  /**
   * 清除头尾的空白字符
   */
  TRIM = 'trim',
  /**
   * 全部转成小写
   */
  LOWER_CASE = 'lower-case',
  /**
   * 全部转成大写
   */
  UPPER_CASE = 'upper-case',
  /**
   * 首字母大写
   */
  CAPITAL_CASE = 'capital-case',
  /**
   * 小写驼峰式(首字母小写)
   */
  CAMEL_CASE = 'camel-case',
  /**
   * 大写驼峰式（首字母大写）
   */
  PASCAL_CASE = 'pascal-case',
  /**
   * 小写串式
   */
  KEBAB_CASE = 'kebab-case',
  /**
   * 小写下划线连接式
   */
  SNAKE_CASE = 'snake-case',
  /**
   * 大写下划线连接式
   */
  CONSTANT_CASE = 'constant-case',
}


// StringTransformType 集合
export const StringTransformTypeSet = new Set<string>(Object.values(StringTransformType))


/**
 * 原生的字符串类型数据模式，用户在配置文件中指定的对象类型
 * 参见 https://json-schema.org/understanding-json-schema/reference/string.html
 */
export interface RawStringDataSchema extends RawDataSchema<STRING_T_TYPE, STRING_V_TYPE> {
  /**
   * 最小的长度，需大于等于 0
   */
  minLength?: number
  /**
   * 最长的长度，需大于 0
   */
  maxLength?: number
  /**
   * 字符串的模式
   */
  pattern?: string
  /**
   * 预置的模式，和其它属性按照“与”逻辑进行校验
   * 若指定了多个，则表示“或”的关系，如 { format: ['ipv4', 'ipv6' ] } 表示既可为 ipv4 地址也可为 ipv6 地址
   */
  format?: StringFormat | StringFormat[]
  /**
   * 数据转换方式
   * 若指定了多个，则表示“或”的关系，如 { transform: ['lowercase', 'trim' ] } 表示执行 `s.toLowercase().trim()`
   */
  transform?: StringTransformType | StringTransformType[]
  /**
   * 枚举项列表，数据项的值包括 default 均需为 enum 中的值
   */
  enum?: string[]
}


/**
 * 字符串类型的数据模式，编译 RawStringDataSchema 后得到的结果
 */
export interface StringDataSchema extends DataSchema<STRING_T_TYPE, STRING_V_TYPE> {
  /**
   * 最小的长度，需大于等于 0
   */
  minLength?: number
  /**
   * 最长的长度，需大于 0
   */
  maxLength?: number
  /**
   * 字符串的模式
   */
  pattern?: RegExp
  /**
   * 预置的模式，和其它属性按照“与”逻辑进行校验
   * 若指定了多个，则表示“或”的关系，如 { format: ['ipv4', 'ipv6' ] } 表示既可为 ipv4 地址也可为 ipv6 地址
   */
  format?: StringFormat[]
  /**
   * 数据转换方式
   * 若指定了多个，则表示“或”的关系，如 { transform: ['lowercase', 'trim' ] } 表示执行 `s.toLowercase().trim()`
   */
  transform?: StringTransformType | StringTransformType[]
  /**
   * 枚举项列表，数据项的值包括 default 均需为 enum 中的值
   */
  enum?: string[]
}
