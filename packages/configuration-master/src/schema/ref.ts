import { DataSchema, RawDataSchema } from '../_core/schema'

// RefDataSchema.type 的类型
export const REF_T_TYPE = 'ref'
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type REF_T_TYPE = typeof REF_T_TYPE

// RefDataSchema.value 的类型
export type REF_V_TYPE = any

/**
 * 原生的引用类型数据模式，用户在配置文件中指定的对象类型
 *
 * 被引用的 DataSchema 中的 default 和 required 属性不生效
 */
export interface RawRefDataSchema
  extends RawDataSchema<REF_T_TYPE, REF_V_TYPE> {
  /**
   * 引用的 DataSchema 的 $id
   */
  $ref: string
}

/**
 * 引用类型的数据模式，编译 RawRefDataSchema 后得到的结果
 */
export interface RefDataSchema extends DataSchema<REF_T_TYPE, REF_V_TYPE> {
  /**
   * 引用的 DataSchema 的 $id
   */
  $ref: string
}
