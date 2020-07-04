/**
 * http 动词
 */
export enum HttpVerb {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DEL = 'DEL',
  DELETE = 'DELETE',
}


/**
 * 未经处理的 API 条目
 */
export interface RawApiItem {
  /**
   * 接口名称
   * @description the name of the API item
   */
  name: string
  /**
   * 接口标题
   * @description the title of the API item;
   *              if no value is specified, the value of `name` will be used as the default
   */
  title?: string
  /**
   * 接口描述信息
   * @description the description of the API item
   * @default
   */
  description: string
  /**
   * 接口路由路径，会以所属组的默认路径作为路由路径前缀
   * @description the routing path of the API item;
   *              the prefixPath of the group belongs to the prefix path
   * @default
   */
  path: string
  /**
   * 完整的路径，不以所属组中定义的路由路径为前缀
   * @description the full routing path of the API item
   */
  fullPath?: string
  /**
   * 请求方法；http 动词
   * 若所属的 ApiItemGroup 中定义了 method，则默认值为其所属的 ApiItemGroup 的 method
   * @description the HTTP verbs of the API item
   * #default HttpVerb.GET
   */
  method?: HttpVerb
  /**
   * http 请求的配置
   * 若为 string，则表示指定 request.fullModelName
   * @description the configuration of the request object in an HTTP request
   * @default {}
   */
  request: {
    /**
     * 请求对象的数据模型名称（ts 类型名称）
     * 若未指定，即当前所属的组为 p，则 model 值将设置为
     *   `toPascalCase(p.request.modelNamePrefix + this.name + p.request.modelNameSuffix)`
     *
     * @description the data model name of the request object (ts type name);
     *              if not specified, that is, the group to which the current
     *              belongs is `p`, the model value will be set to
     *              `toPascalCase (p.request.modelNamePrefix + this.name + p.request.modelNameSuffix)`
     */
    model?: string
    /**
     * 完整的模型名称，忽略所属组的 `request.modelNamePrefix` 和 `request.modelNameSuffix` 属性
     * @description the full data model name (ts type name) of the request object
     */
    fullModelName?: string
    /**
     * 请求对象的数据模型对应的 JSON-Schema 的文件路径
     * 若未指定，则由解析器生成默认路径
     * @description file path of the JSON-Schema corresponding to the data model of the request object
     */
    schema?: string
  } | string
  /**
   * http 响应的配置
   * 若为 string，则表示指定 response.fullModelName
   * @description the configuration of the response object in an HTTP response
   * @default {}
   */
  response: {
    /**
     * 响应对象的数据模型名称（ts 类型名称）
     * 若未指定，即当前所属的组为 p，则 model 值将设置为
     *   `toPascalCase(p.response.modelNamePrefix + this.name + p.response.modelNameSuffix)`
     *
     * @description the data model name of the response object (ts type name);
     *              if not specified, that is, the group to which the current
     *              belongs is `p`, the model value will be set to
     *              `toPascalCase (p.response.modelNamePrefix + this.name + p.response.modelNameSuffix)`
     */
    model?: string
    /**
     * 完整的模型名称，忽略所属组的 `response.modelNamePrefix` 和 `response.modelNameSuffix` 属性
     * @description the full data model name (ts type name) of the response object
     */
    fullModelName?: string
    /**
     * 响应对象的数据模型对应的 JSON-Schema 的文件路径
     * 若未指定，则由解析器生成默认路径
     * @description file path of the JSON-Schema corresponding to the data model of the response object
     */
    schema?: string
    /**
     * 额外的响应头部信息
     * @description additional response headers in an HTTP response
     */
    headers?: {
      [key: string]: string
    } | string
  }
}


/**
 * API 接口条目
 */
export interface ApiItem {
  /**
   * 接口名称
   * @description the name of the API item
   */
  name: string
  /**
   * 接口标题
   * @description the title of the API item
   */
  title: string
  /**
   * 接口描述信息
   * @description the description of the API item
   */
  description: string
  /**
   * 接口路由路径，完整的路径
   * @description the full routing path of the API item
   */
  path: string
  /**
   * 请求方法；HTTP 动词
   * @description the HTTP verbs of the API item
   */
  method: HttpVerb
  /**
   * HTTP 请求的配置
   * @description the configuration of the request object in an HTTP request
   */
  request: {
    /**
     * 请求对象的数据模型名称（ts 类型名称），完整的模型名称
     * @description the full data model name (ts type name) of the request object
     */
    model: string
    /**
     * 请求对象的数据模型对应的 JSON-Schema 的文件路径
     * @description file path of the JSON-Schema corresponding to the data model of the request object
     */
    schema: string
  }
  /**
   * HTTP 响应的配置
   * @description the configuration of the response object in an HTTP response
   */
  response: {
    /**
     * 响应对象的数据模型名称（ts 类型名称），完整的模型名称
     * @description the full data model name (ts type name) of the response object
     */
    model: string
    /**
     * 响应对象的数据模型对应的 JSON-Schema 的文件路径
     * @description file path of the JSON-Schema corresponding to the data model of the response object
     */
    schema: string
    /**
     * 额外的响应头部信息
     * @description additional response headers in an HTTP response
     */
    headers?: {
      [key: string]: string
    }
  }
}
