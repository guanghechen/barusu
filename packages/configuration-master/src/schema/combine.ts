import { DSchema, DataSchema, RDSchema, RawDataSchema } from '../_core/schema'

// CombineDataSchema.type 的类型
export const COMBINE_T_TYPE = 'combine'
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type COMBINE_T_TYPE = typeof COMBINE_T_TYPE

// CombineDataSchema.value 的类型
export type COMBINE_V_TYPE = any

/**
 * 组合模式策略
 */
export enum CombineStrategy {
  /**
   * 指定的多项组合类型数据模式需全部满足，才算校验通过
   */
  ALL = 'all',
  /**
   * 指定的多项组合类型数据模式中，满足任意模式就算校验通过
   */
  ANY = 'any',
  /**
   * 指定的多项组合类型数据模式中，满足且仅满足一种模式才算校验通过
   */
  ONE = 'one',
}

// values of CombineStrategy
export const combineStrategies: string[] = Object.values(CombineStrategy)

/**
 * 原生的组合类型数据模式，用户在配置文件中指定的对象类型
 *
 * allOf, anyOf, oneOf 这三项至少指定一个，
 * 若指定了多个，则按照 'strategy' 中定义的值来处理
 *
 * 参见 https://json-schema.org/understanding-json-schema/reference/combine.html
 */
export interface RawCombineDataSchema
  extends RawDataSchema<COMBINE_T_TYPE, COMBINE_V_TYPE> {
  /**
   * 当 allOf, anyOf, oneOf 这三项中有多项被指定时的模式策略
   * @default all
   */
  strategy?: CombineStrategy
  /**
   * 需要满足所有 allOf 中定义的 DataSchema 才算校验通过
   * https://json-schema.org/understanding-json-schema/reference/combining.html#allof
   */
  allOf?: RDSchema[]
  /**
   * 满足 anyOf 中任一定义的 DataSchema 就算校验通过
   * 参见 https://json-schema.org/understanding-json-schema/reference/combining.html#anyof
   */
  anyOf?: RDSchema[]
  /**
   * 满足且满足 oneOf 中定义的某个 DataSchema 才算校验通过
   * 参见 https://json-schema.org/understanding-json-schema/reference/combining.html#oneof
   */
  oneOf?: RDSchema[]
}

/**
 * 组合类型的数据模式，编译 RawCombineDataSchema 后得到的结果
 *
 * allOf, anyOf, oneOf 这三项至少指定一个，
 * 若指定了多个，则按照 'strategy' 中定义的值来处理
 */
export interface CombineDataSchema
  extends DataSchema<COMBINE_T_TYPE, COMBINE_V_TYPE> {
  /**
   * 当 allOf, anyOf, oneOf 这三项中有多项被指定时的模式策略
   */
  strategy: CombineStrategy
  /**
   * 需要满足所有 allOf 中定义的 DataSchema 才算校验通过
   * https://json-schema.org/understanding-json-schema/reference/combining.html#allof
   */
  allOf?: DSchema[]
  /**
   * 满足 anyOf 中任一定义的 DataSchema 就算校验通过
   * 参见 https://json-schema.org/understanding-json-schema/reference/combining.html#anyof
   */
  anyOf?: DSchema[]
  /**
   * 满足且满足 oneOf 中定义的某个 DataSchema 才算校验通过
   * 参见 https://json-schema.org/understanding-json-schema/reference/combining.html#oneof
   */
  oneOf?: DSchema[]
}
