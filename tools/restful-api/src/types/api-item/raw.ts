import { HttpRequestHeaders, HttpResponseHeaders, HttpVerb } from '../http'


/**
 * 未经处理的，用户直接在配置文件中指定的 API 条目
 * @description unprocessed API item
 */
export interface RawApiItem {
  /**
   * 接口名称
   * @description Name of this api item
   */
  name: string
  /**
   * 接口是否可用
   * @description Whether this api item is available
   * @default true
   */
  active?: boolean
  /**
   * 接口标题
   * @description Title of this api item
   * @default @name
   */
  title?: string
  /**
   * 接口描述
   * @description Description of this api item
   * @default
   */
  desc?: string
  /**
   * 同 @desc
   * @description identified as @desc
   */
  description?: string
  /**
   * 接口路由路径，会以所属组的默认路径作为路由路径前缀
   * @description the routing path of the API item;
   *              the prefixPath of the group belongs to the prefix path
   * @default
   */
  path?: string
  /**
   * 完整的路径，不以所属组中定义的路由路径为前缀
   * @description the full routing path of the API item
   * @default
   */
  fullPath?: string
  /**
   * 请求方法；HTTP 动词
   * @description HTTP method supported of this api item
   * @default
   */
  method?: HttpVerb
  /**
   * HTTP 请求的配置
   * @description the configuration of the request object in an HTTP request
   */
  request?: {
    /**
     * 请求数据对应的数据模型的 TypeScript 接口名
     * @description The corresponding RequestVo interface name of current ApiItem in TypeScript
     */
    voName: string
    /**
     * 请求对象的数据模型对应的 JSON-Schema 的文件路径
     * 若未指定，则由解析器生成默认路径
     * @description The JSON-Schema path of the corresponding RequestVo
     */
    schemaPath?: string
    /**
     * 请求对象的 HTTP headers
     * @description HTTP request headers (Received from client)
     */
    headers?: HttpRequestHeaders
  } | {
    /**
     * 完整的请求对象接口名称，忽略所属组的 `request.voNamePrefix` 和
     * `request.voNameSuffix` 属性
     *
     * @description the full corresponding RequestVo interface name of current
     *              ApiItem in TypeScript, ignoring the group's properties (
     *              `request.voNamePrefix` and `request.voNameSuffix`) effect
     */
    voFullName: string
    /**
     * 请求对象的数据模型对应的 JSON-Schema 的文件路径
     * 若未指定，则由解析器生成默认路径
     * @description The JSON-Schema path of the corresponding RequestVo
     */
    schemaPath?: string
    /**
     * 请求对象的 HTTP headers
     * @description HTTP request headers (Received from client)
     */
    headers?: HttpRequestHeaders
  } | string
  /**
   * HTTP 响应的配置
   * @description the configuration of the response object in an HTTP response
   */
  response?: {
    /**
     * 响应数据对应的数据模型的 TypeScript 接口名
     * @description The corresponding ResponseVo interface name of current ApiItem in TypeScript
     */
    voName: string
    /**
     * 响应对象的数据模型对应的 JSON-Schema 的文件路径
     * 若未指定，则由解析器生成默认路径
     * @description The JSON-Schema path of the corresponding ResponseVo
     */
    schemaPath?: string
    /**
     * 响应对象的 HTTP headers (外部指定的在响应时返回给客户端的 HTTP 头部信息)
     * @description HTTP response headers (externally specified to return to the client)
     */
    headers?: HttpRequestHeaders
  } | {
    /**
     * 完整的响应对象接口名称，忽略所属组的 `response.voNamePrefix` 和
     * `response.voNameSuffix` 属性
     *
     * @description the full corresponding ResponseVo interface name of current
     *              ApiItem in TypeScript, ignoring the group's properties (
     *              `response.voNamePrefix` and `response.voNameSuffix`) effect
     */
    voFullName: string
    /**
     * 响应对象的数据模型对应的 JSON-Schema 的文件路径
     * 若未指定，则由解析器生成默认路径
     * @description The JSON-Schema path of the corresponding ResponseVo
     */
    schemaPath?: string
    /**
     * 响应对象的 HTTP headers (外部指定的在响应时返回给客户端的 HTTP 头部信息)
     * @description HTTP response headers (externally specified to return to the client)
     */
    headers?: HttpResponseHeaders
  } | string
}
