import { DataSchema, RawDataSchema } from '../_core/schema'


// NumberDataSchema.type 的类型
export const NUMBER_T_TYPE = 'number'
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type NUMBER_T_TYPE = typeof NUMBER_T_TYPE

// NumberDataSchema.value 的类型
export type NUMBER_V_TYPE = number


/**
 * 原生的数字类型数据模式，用户在配置文件中指定的对象类型
 * 参见 https://json-schema.org/understanding-json-schema/reference/numeric.html
 */
export interface RawNumberDataSchema extends RawDataSchema<NUMBER_T_TYPE, NUMBER_V_TYPE> {
  /**
   * 最小值（可取到）
   */
  minimum?: number
  /**
   * 最大值（可取到）
   */
  maximum?: number
  /**
   * 最小值（不可取到）
   */
  exclusiveMinimum?: number
  /**
   * 最大值（不可取到）
   */
  exclusiveMaximum?: number
  /**
   * 枚举项列表，数据项的值包括 default 均需为 enum 中的值
   */
  enum?: number[]
}


/**
 * 数字类型的数据模式，编译 RawNumberDataSchema 后得到的结果
 */
export interface NumberDataSchema extends DataSchema<NUMBER_T_TYPE, NUMBER_V_TYPE> {
  /**
   * 最小值（可取到）
   */
  readonly minimum?: number
  /**
   * 最大值（可取到）
   */
  readonly maximum?: number
  /**
   * 最小值（不可取到）
   */
  readonly exclusiveMinimum?: number
  /**
   * 最大值（不可取到）
   */
  readonly exclusiveMaximum?: number
  /**
   * 枚举项列表，数据项的值包括 default 均需为 enum 中的值
   */
  readonly enum?: number[]
}
