import { DSchema, DataSchema, RDSchema, RawDataSchema } from '../_core/schema'
import { RawStringDataSchema, StringDataSchema } from './string'


// ObjectDataSchema.type 的类型
export const OBJECT_T_TYPE = 'object'
export type OBJECT_T_TYPE = typeof OBJECT_T_TYPE

// ObjectDataSchema.value 的类型
export type OBJECT_V_TYPE = Record<string, unknown>


/**
 * 原生的对象类型数据模式，用户在配置文件中指定的对象类型
 * 参见 https://json-schema.org/understanding-json-schema/reference/object.html
 */
export interface RawObjectDataSchema extends RawDataSchema<OBJECT_T_TYPE, OBJECT_V_TYPE> {
  /**
   * 必须存在的属性，若属性自身设置了 required，可以覆盖此值
   */
  requiredProperties?: string[]
  /**
   * 对象属性的类型，定义对象可能出现的若干属性的属性名及其类型
   * 参见 https://json-schema.org/understanding-json-schema/reference/object.html#properties
   */
  properties?: { [key: string]: RDSchema }
  /**
   * 对象属性的类型，和 properties 类似，但是名称为正则表达式
   * @member pattern  属性名称的正则表达式
   */
  patternProperties?: { [pattern: string]: RDSchema } | { pattern: string, schema: RDSchema }[]
  /**
   * 是否允许其它额外的属性，若为 false 且指定了 properties，
   * 则对象中只有 properties 中出现的属性会被采用，其它的属性将被忽略，
   * 如下的 Schema 中，数据对象不能出现除 `name` 以外的其它属性（编译器/校验器会忽略这些额外的属性）：
   *  {
   *    properties: {
   *      name: { type: 'string' }
   *    },
   *    additionalProperties: false
   *  }
   *
   * @default false
   */
  allowAdditionalProperties?: boolean
  /**
   * 对象属性名的数据类型
   * 参见 https://json-schema.org/understanding-json-schema/reference/object.html#property-names
   */
  propertyNames?: RawStringDataSchema
  /**
   * 定义对象的属性的依赖，如：若定义了属性 A，属性 B 和 C 必须出现，则可以定义为：
   * {
   *   ...
   *   dependencies: {
   *     A: ['B', 'C']
   *   }
   *   ...
   * }
   *
   * 参见 https://json-schema.org/understanding-json-schema/reference/object.html#dependencies
   */
  dependencies?: { [key: string]: string[] }
  /**
   * 若为 true，则当数据中出现不合法的额外属性时，不添加警告信息
   * @default false
   */
  silentIgnore?: boolean
}


/**
 * 对象类型的数据模式，编译 RawObjectDataSchema 后得到的结果
 */
export interface ObjectDataSchema extends DataSchema<OBJECT_T_TYPE, OBJECT_V_TYPE> {
  /**
   * 是否允许其它额外的属性，若为 false 且指定了 properties，
   * 则对象中只有 properties 中出现的属性会被采用，其它的属性将被忽略
   */
  allowAdditionalProperties: boolean
  /**
   * 若为 true，则当数据中出现不合法的额外属性时，不添加警告信息
   */
  silentIgnore: boolean
  /**
   * 必须存在的属性，若属性自身（properties 中）设置了 required，可以覆盖此值
   * 但若是在 propertyName 中设置了 required，无法覆盖此值，因为 propertyName 定义的是属性名的规则，
   * 在编译阶段无法使用它进行校验
   */
  requiredProperties: string[]
  /**
   * 对象属性的类型
   */
  properties?: { [key: string]: DSchema }
  /**
   * 对象属性的类型，和 properties 类似，但是名称为正则表达式
   * @member pattern  属性名称的正则表达式
   */
  patternProperties?: { pattern: RegExp, schema: DSchema }[]
  /**
   * 对象属性名的数据类型
   */
  propertyNames?: StringDataSchema
  /**
   * 定义对象的属性的依赖，如：若定义了属性 A，属性 B 和 C 必须出现，则可以定义为：
   */
  dependencies?: { [key: string]: string[] }
}
