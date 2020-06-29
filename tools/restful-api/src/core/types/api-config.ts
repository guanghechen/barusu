import { RawApiItemGroup } from './api-item-group'


/**
 * 未经处理的 API 配置内容
 */
export interface RawApiConfig {
  /**
   * 模型对应的 JSON-Schema 的输出目录
   * @default
   */
  schemaDir: string
  /**
   * 接口组
   * 既可为数组格式，也可为对象格式；若为对象格式，键值为条目的 `name`
   * @description sub API group;
   *              either an array format or an object format;
   *              if it is an object format, the key is the name of the entry
   */
  api: RawApiItemGroup[] | { [name: string]: Omit<RawApiItemGroup, 'name'> }
}


/**
 * API 配置内容
 */
export interface ApiConfig extends ApiConfigContext {
  /**
   * 接口组
   * 既可为数组格式，也可为对象格式；若为对象格式，键值为条目的 `name`
   * @description sub API group;
   *              either an array format or an object format;
   *              if it is an object format, the key is the name of the entry
   */
  api: RawApiItemGroup[]
}


/**
 * 解析 API 条目/组的上下文配置
 */
export interface ApiConfigContext {
  /**
   * 模型对应的 JSON-Schema 的输出路径
   */
  schemaDir: string
}
