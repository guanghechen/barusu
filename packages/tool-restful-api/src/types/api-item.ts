import type { HttpRequestHeaders, HttpResponseHeaders, HttpVerb } from './http'

/**
 * Type of API response configuration.
 */
export interface ApiItemRequestConfig {
  /**
   * @description The corresponding name of RequestVo defined as a TypeScript interface in the sourcecodes.
   */
  model: string
  /**
   * @description The JSON-Schema path of the corresponding RequestVo
   */
  schemaPath: string
  /**
   * @description HTTP request headers.
   */
  headers?: HttpRequestHeaders
}

/**
 * Type of API request configuration.
 */
export interface ApiItemResponseConfig {
  /**
   * @description The corresponding name of ResponseVo defined as a TypeScript interface in the sourcecodes.
   */
  model: string
  /**
   * @description The JSON-Schema path of the corresponding ResponseVo.
   */
  schemaPath: string
  /**
   * @description HTTP response headers.
   */
  headers?: HttpResponseHeaders
}

/**
 * Type of API configuration.
 */
export interface ApiItemConfig {
  /**
   * @description API name
   */
  name: string
  /**
   * @description Whether the API item is active.
   * @default true
   */
  active: boolean
  /**
   * @description API title.
   * @default @name
   */
  title: string
  /**
   * @description API description.
   */
  description: string
  /**
   * @description API absolute routing path.
   */
  path: string
  /**
   * @description HTTP method types that can access this API.
   */
  methods: HttpVerb[]
  /**
   * @description Configuration of the request object in an HTTP request.
   */
  request:
    | ApiItemRequestConfig
    | (Pick<ApiItemRequestConfig, 'headers'> & Partial<ApiItemRequestConfig>)
  /**
   * @description Configuration of the response object in an HTTP request.
   */
  response: ApiItemResponseConfig
}
