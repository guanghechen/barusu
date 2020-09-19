// short form of DataSchema
export type RDSchema = RawDataSchema<string, any>
export type DSchema = DataSchema<string, any>

// short form of DefinitionDataSchema
export type RDDSchema = RawDefinitionDataSchema<string, any>
export type DDSchema = DefinitionDataSchema<string, any>

// short form of TopDataSchema
export type RTDSchema = RawTopDataSchema<string, any>
export type TDSchema = TopDataSchema<string, any>


/**
 * the raw data object of DataSchema
 *
 * 原生的 DataSchema 对象，用户在配置文件中指定的对象类型
 */
export interface RawDataSchema<T extends string, V> {
  /**
   * 模式类型
   */
  type: T
  /**
   * 默认值
   */
  default?: V
  /**
   * 是否必须
   * @default false
   */
  required?: boolean
  /**
   * 描述信息
   * 描述信息
   */
  description?: string
}


/**
 * 数据模式对象
 */
export interface DataSchema<T extends string, V> {
  /**
   * 模式类型
   */
  readonly type: T
  /**
   * 是否必须
   */
  readonly required: boolean
  /**
   * 默认值
   */
  readonly default?: V
  /**
   * 描述信息
   */
  readonly description?: string
}


/**
 * the raw data object of DefinitionDataSchema
 *
 * DefinitionDataSchema 的原始数据对象
 *
 * @see #DefinitionDataSchema
 */
export interface RawDefinitionDataSchema<T extends string, V> extends RawDataSchema<T, V> {
  /**
   * The unique identifier of the DataSchema;
   * If this value is specified, it can be directly referenced by a
   * RefDataSchema through this value
   *
   * DataSchema 的唯一标识；
   * 若指定此值，则可以被 RefDataSchema 直接通过此值引用
   *
   * @see https://json-schema.org/understanding-json-schema/structuring.html#the-id-property
   */
  $id?: string
}


/**
 * Define a reusable DataSchema which can be referenced by $ref in RefDataSchema
 *
 * 定义可被重复使用的 DataSchema，即可被 RefDataSchema 中的 `$ref` 所引用的 DataSchema
 *
 * @see https://json-schema.org/understanding-json-schema/structuring.html#reuse
 */
export interface DefinitionDataSchema<T extends string, V> extends DataSchema<T, V> {
  /**
   * The unique identifier of the DataSchema;
   * If this value is specified, it can be directly referenced
   * by a RefDataSchema through this value
   *
   * DataSchema 的唯一标识；
   * 若指定此值，则可以被 RefDataSchema 直接通过此值引用
   *
   * @see https://json-schema.org/understanding-json-schema/structuring.html#the-id-property
   */
  readonly $id?: string
}


/**
 * the raw data object of TopDataSchema
 *
 * TopDataSchema 的原始数据对象
 *
 * @see #TopDataSchema
 */
export interface RawTopDataSchema<T extends string, V> extends RawDataSchema<T, V> {
  /**
   * Define a DataSchema that can be reused, that is, a DataSchema
   * referenced by `$ref` in RefDataSchema
   *  * If DefinitionDataSchema specifies `$id`, it can be referenced directly
   *    through `{ $ref: <$id>}`
   *  * Can also be referenced via `#/definitions/<name>`
   *
   * 定义可被重复使用的 DataSchema，即可被 RefDataSchema 中的 `$ref` 所引用的 DataSchema
   *  * 若 DefinitionDataSchema 指定了 `$id`，则可直接通过 `{ $ref: <$id> }` 进行引用
   *  * 也可以通过 `#/definitions/<name>` 进行引用
   *
   * @see https://json-schema.org/understanding-json-schema/structuring.html#reuse
   */
  definitions?: { [name: string]: RawDefinitionDataSchema<T, V> }
}


/**
 * The top-level DataSchema, which is the root node of the DataSchema data tree.
 * Corresponds to the JSON-SCHEMA file.
 * Defines the common state and entry nodes in the DataSchema tree.
 *
 * 顶层 DataSchema，即 DataSchema 数据树的根节点；和 JSON-SCHEMA 文件对应；
 * 定义了 DataSchema 树中的公共状态和入口节点
 */
export interface TopDataSchema<T extends string, V> extends DataSchema<T, V> {
  /**
   * Define a DataSchema that can be reused, that is, a DataSchema referenced
   * by `$ref` in RefDataSchema
   *  * If DefinitionDataSchema specifies `$id`, it can be referenced directly
   *    through `{ $ref: <$id>}`
   *  * Can also be referenced via `#/definitions/<name>`
   *
   * 定义可被重复使用的 DataSchema，即可被 RefDataSchema 中的 `$ref` 所引用的 DataSchema
   *  * 若 DefinitionDataSchema 指定了 `$id`，则可直接通过 `{ $ref: <$id> }` 进行引用
   *  * 也可以通过 `#/definitions/<name>` 进行引用
   *
   * @see https://json-schema.org/understanding-json-schema/structuring.html#reuse
   */
  readonly definitions?: { [name: string]: DefinitionDataSchema<T, V> }
}
