import type { RawApiItem } from '../api-item/raw'
import type { HttpRequestHeaders, HttpResponseHeaders, HttpVerb } from '../http'

/**
 * 未经处理的，用户直接在配置文件中指定的 API 条目组
 *  - 子组中对应的未设置的项将继承父接口组中对应的项
 *  - 子组中设置为 null 的项，表示未设置任何值，且不会继承父接口中对应的项
 * @description unprocessed API item group
 */
export interface RawApiItemGroup {
  /**
   * API 接口组的名称
   * @description the name of the API group
   */
  name: string
  /**
   * 接口是否可用
   * @description Whether this api item group is available
   * @default true
   */
  active?: boolean
  /**
   * API 接口组的标题
   * @description the title of the API group
   * @default @name
   */
  title?: string
  /**
   * API 接口组的描述
   * @description the description of the API group
   * @default
   */
  desc?: string
  /**
   * 同 @desc
   * @description identified as @desc
   */
  description?: string
  /**
   * API 接口组内的路由前缀
   * @description the prefix path of the route in the API group
   * @default
   */
  path?: string
  /**
   * API 接口组内的默认 HTTP 动词
   * @description the default HTTP verbs in the API group
   */
  method?: HttpVerb
  /**
   * 组内接口的请求对象的数据模型名称的配置
   * @description the configuration of the request object in an HTTP request
   * @default {}
   */
  request?: {
    /**
     * 组内接口的请求对象的数据模型名称前缀
     * @description the request data model name prefix for ApiItem.request.model within the API group
     * @default
     */
    voNamePrefix?: string
    /**
     * 组内接口的请求对象的数据模型名称后缀
     * @description the request data model name suffix for ApiItem.request.model within the API group
     * @default RequestVo
     */
    voNameSuffix?: string
    /**
     * 组内请求的额外请求头部信息
     * @description additional request headers for requests within the API group
     */
    headers?: HttpRequestHeaders
  }
  /**
   * 组内接口的请求对象的数据模型名称的配置
   * @description the configuration of the response object in an HTTP response
   * @default {}
   */
  response?: {
    /**
     * 组内接口的响应对象的数据模型名称前缀
     * @description the response data model name prefix for ApiItem.response.model within the API group
     * @default
     */
    voNamePrefix?: string
    /**
     * 组内接口的响应对象的数据模型名称后缀
     * @description the response data model name suffix for ApiItem.response.model within the API group
     * @default ResponseVo
     */
    voNameSuffix?: string
    /**
     * 组内请求的额外响应头部信息
     * @description additional response headers for requests within the API group
     */
    headers?: HttpResponseHeaders
  }
  /**
   * 子接口组
   * 既可为数组格式，也可为对象格式；若为对象格式，键值为条目的 `name`
   * @description sub API group;
   *              either an array format or an object format;
   *              if it is an object format, the key is the name of the entry
   */
  subGroups?: RawApiItemGroup[] | Record<string, Omit<RawApiItemGroup, 'name'>>
  /**
   * 接口组的接口内容
   * 既可为数组格式，也可为对象格式；若为对象格式，键值为条目的 `name`
   * @description API items in the API group
   *              either an array format or an object format;
   *              if it is an object format, the key is the name of the entry
   * @default []
   */
  items?: RawApiItem[] | Record<string, Omit<RawApiItem, 'name'>>
}
