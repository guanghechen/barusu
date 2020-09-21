import { NumberDataSchema, RawNumberDataSchema } from './number'


// IntegerDataSchema.type 的类型
export const INTEGER_T_TYPE = 'integer'
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type INTEGER_T_TYPE = typeof INTEGER_T_TYPE

// IntegerDataSchema.value 的类型
export type INTEGER_V_TYPE = number


/**
 * 原生的整数类型数据模式，用户在配置文件中指定的对象类型
 * 参见 https://json-schema.org/understanding-json-schema/reference/numeric.html
 */
export interface RawIntegerDataSchema extends Omit<RawNumberDataSchema, 'type'> {
  /**
   * 整数类型
   */
  type: INTEGER_T_TYPE
}


/**
 * 整数类型的数据模式，编译 RawIntegerDataSchema 后得到的结果
 */
export interface IntegerDataSchema extends Omit<NumberDataSchema, 'type'> {
  /**
   * 整数类型
   */
  type: INTEGER_T_TYPE
}
