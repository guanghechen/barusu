import { DataSchema, RawDataSchema } from '../_core/schema'

// NullDataSchema.type 的类型
export const NULL_T_TYPE = 'null'
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type NULL_T_TYPE = typeof NULL_T_TYPE

// NullDataSchema.value 的类型
export type NULL_V_TYPE = null

/**
 * null 类型的数据模式
 */
export interface RawNullDataSchema
  extends RawDataSchema<NULL_T_TYPE, NULL_V_TYPE> {}

/**
 * null 类型的数据模式，编译 RawNullDataSchema 后得到的结果
 */
export interface NullDataSchema extends DataSchema<NULL_T_TYPE, NULL_V_TYPE> {}
