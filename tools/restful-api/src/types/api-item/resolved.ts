import { HttpRequestHeaders, HttpResponseHeaders, HttpVerb } from '../http'


/**
 * 格式化后的 API 条目
 * @description Formatted API item
 */
export interface ResolvedApiItem {
  /**
   * 接口名称
   * @description Name of this api item
   */
  name: string
  /**
   * 接口是否可用
   * @description Whether this api item group is available
   */
  active: boolean
  /**
   * 接口标题
   * @description Title of this api item
   */
  title: string
  /**
   * 接口描述
   * @description Description of this api item
   */
  desc: string
  /**
   * 接口路由路径，完整的路径
   * @description the full routing path of this api item
   */
  path: string
  /**
   * 请求方法；HTTP 动词
   * @description HTTP method supported of this api item
   */
  method: HttpVerb
  /**
   * HTTP 请求的配置
   * @description the configuration of the request object in an HTTP request
   */
  request: {
    /**
     * 请求数据对应的数据模型的 TypeScript 接口名
     * @description The corresponding RequestVo interface name of current ApiItem in TypeScript
     */
    voName?: string
    /**
     * 请求对象的数据模型对应的 JSON-Schema 的文件路径
     * @description The JSON-Schema path of the corresponding RequestVo
     */
    schemaPath?: string
    /**
     * 请求对象的 HTTP headers
     * @description HTTP request headers (Received from client)
     */
    headers?: HttpRequestHeaders
  }
  /**
   * HTTP 响应的配置
   * @description the configuration of the response object in an HTTP response
   */
  response: {
    /**
     * 响应数据对应的数据模型的 TypeScript 接口名
     * @description The corresponding ResponseVo interface name of current ApiItem in TypeScript
     */
    voName: string
    /**
     * 响应对象的数据模型对应的 JSON-Schema 的文件路径
     * @description The JSON-Schema path of the corresponding ResponseVo
     */
    schemaPath: string
    /**
     * 响应对象的 HTTP headers (外部指定的在响应时返回给客户端的 HTTP 头部信息)
     * @description HTTP response headers (externally specified to return to the client)
     */
    headers?: HttpResponseHeaders
  }
}
