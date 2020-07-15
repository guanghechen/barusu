import { DDSchema, RDDSchema, TDSchema } from './types'


/**
 * Maintain the DefinitionDataSchema mapping relationship;
 * Used to compile RefDataSchema to determine whether the reference is valid,
 * and set the default value of the optional attribute to the corresponding
 * attribute value of the referenced DataSchema.
 *
 * 维护 DefinitionDataSchema 映射关系；
 * 用于在编译 RefDataSchema 判断引用是否合法，
 * 以及将可选的属性的默认值设置为被引用的 DataSchema 的对应属性值
 */
export class DefinitionDataSchemaMaster {
  /**
   * Mapping of RawDefinitionDataSchema.$id and RawDefinitionDataSchema
   *
   * RawDefinitionDataSchema.$id 和 RawDefinitionDataSchema 的映射
   */
  protected readonly rawSchemaIdMap: Map<string, RDDSchema>
  /**
   * Mapping of RawDefinitionDataSchema path and RawDefinitionDataSchema
   *
   * RawDefinitionDataSchema 路径和 RawDefinitionDataSchema 的映射
   */
  protected readonly rawSchemaPathMap: Map<string, RDDSchema>
  /**
   * 路径前缀
   */
  protected readonly pathPrefix: string

  public constructor(pathPrefix?: string) {
    this.pathPrefix =  pathPrefix || '#/definitions/'
    this.rawSchemaIdMap = new Map()
    this.rawSchemaPathMap = new Map()
  }

  /**
   * 清空 Map
   */
  public clear(): void {
    this.rawSchemaIdMap.clear()
    this.rawSchemaPathMap.clear()
  }

  /**
   * Mapping DefinitionDataSchema attribute names in TopDataSchema to reference paths;
   * As in `{ "definitions" : { "tree" : xxx } }`:
   *  - name is `tree`
   *  - path is `#/definitions/tree`
   *
   * 将 DefinitionDataSchema 在 TopDataSchema 中的属性名称映射为引用路径；
   * 如 `{ "definitions" : { "tree": xxx  } }` 中：
   *  - name 为 `tree`
   *  - path 为 `#/definitions/tree`
   * @param name
   */
  public nameToPath(name: string) {
    return this.pathPrefix + name
  }

  /**
   * 添加 RawDefinitionDataSchema
   * @param $path       path like `#/definitions/node`
   * @param rawSchema   RawDefinitionDataSchema
   * @param $id         the $id of RawDefinitionDataSchema
   */
  public addRawSchema($path: string, rawSchema: RDDSchema, $id?: string) {
    // check if $id is duplicate
    if ($id != null && this.rawSchemaIdMap.has($id)) {
      throw new Error(`[DefinitionDataSchemaMaster.addRawSchema] $id(${ $id }) has existed`)
    }

    // check if $path is duplicate
    if (this.rawSchemaPathMap.has($path)) {
      throw new Error(`[DefinitionDataSchemaMaster.addRawSchema] $path(${ $path }) has existed`)
    }

    // add rawSchema
    if ($id != null) this.rawSchemaIdMap.set($id, rawSchema)
    this.rawSchemaPathMap.set($path, rawSchema)
  }

  /**
   * Get RawDefinitionDataSchema by id/path of DefinitionDataSchema
   *
   * 通过 id/path 获取 RawDefinitionDataSchema
   * @param idOrPath
   */
  public getRawSchema(idOrPath: string): RDDSchema | undefined {
    // try id
    let node = this.rawSchemaIdMap.get(idOrPath)
    if (node != null) return node

    // try path
    node = this.rawSchemaPathMap.get(idOrPath)
    if (node != null) return node

    // not found
    return undefined
  }

  /**
   * Check if a RawDefinitionDataSchema with the specified id/path exists
   *
   * 判断是否存在指定的 id/path 的 RawDefinitionDataSchema
   * @param idOrPath
   */
  public has(idOrPath: string): boolean {
    return this.getRawSchema(idOrPath) != null
  }
}


/**
 * A wrapper class for TopDataSchema, making it capable of querying DefinitionDataSchema
 *
 * TopDataSchema 的封装类，使之具备查询 DefinitionDataSchema 的能力
 */
export class TopDataSchemaMaster {
  /**
   * Path to the current DataSchema definitions
   *
   * 当前 DataSchema 的 definitions 所在的路径
   */
  protected readonly pathPrefix: string

  protected schema?: TDSchema

  public constructor(schema?: TDSchema, pathPrefix?: string) {
    this.schema = schema
    this.pathPrefix =  pathPrefix || '#/definitions/'
  }

  public setSchema (schema: TDSchema) {
    this.schema = schema
  }

  /**
   * Get DefinitionDataSchema via $id or $path (`#/definitions/<name>`)
   *
   * 通过 $id 或者路径（`#/definitions/<name>`）获取 DefinitionDataSchema
   * @param idOrPath
   */
  public getDefinition(idOrPath: string): DDSchema | undefined {
    if (this.schema == null || this.schema.definitions == null) return undefined
    let definitionSchema: DDSchema | undefined

    // get by path (`#/definitions/<name>`)
    if (idOrPath.startsWith(this.pathPrefix)) {
      const $name = idOrPath.substr(this.pathPrefix.length)
      definitionSchema = this.schema.definitions[$name]
      if (definitionSchema != null) return definitionSchema
    }

    // get by $id
    for (const key of Object.getOwnPropertyNames(this.schema.definitions)) {
      definitionSchema = this.schema.definitions[key]
      if (definitionSchema.$id === idOrPath) return definitionSchema
    }

    // not found
    return undefined
  }
}
