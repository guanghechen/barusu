import type { HttpRequestHeaders, HttpResponseHeaders, HttpVerb } from '../http'

/**
 * Type of API response configuration that written by the user.
 */
export interface RawApiItemRequestConfig {
  /**
   * @description The corresponding name of RequestVo defined as a TypeScript interface in the sourcecodes.
   */
  model?: string
  /**
   * @description The JSON-Schema path of the corresponding RequestVo
   */
  schemaPath?: string
  /**
   * @description HTTP request headers.
   */
  headers?: HttpRequestHeaders
}

/**
 * Type of API request configuration that written by the user.
 */
export interface RawApiItemResponseConfig {
  /**
   * @description The corresponding name of ResponseVo defined as a TypeScript interface in the sourcecodes.
   */
  model: string
  /**
   * @description The JSON-Schema path of the corresponding ResponseVo.
   */
  schemaPath?: string
  /**
   * @description HTTP response headers.
   */
  headers?: HttpResponseHeaders
}

/**
 * Type of API configuration that written by the user.
 * @TJS-additionalProperties false
 */
export interface RawApiItemConfig {
  /**
   * @description API name
   */
  name: string
  /**
   * @description Whether the API item is active.
   * @default true
   */
  active?: boolean
  /**
   * @description API title.
   * @default @name
   */
  title?: string
  /**
   * @description API description.
   */
  description?: string
  /**
   * The routing prefix of the group it belongs to will also serve as its
   * routing prefix.
   *
   * @description API routing path, such as `/user/:id`.
   */
  path?: string
  /**
   * @description Whether should use the routing prefix of the ancestor groups.
   * @default false
   */
  withoutPrefix?: boolean
  /**
   * @description HTTP method types that can access this API.
   */
  method?: HttpVerb | HttpVerb[]
  /**
   * @description Configuration of the request object in an HTTP request.
   */
  request?: RawApiItemRequestConfig | string // identified with `RawApiRequestConfig.model`
  /**
   * @description Configuration of the response object in an HTTP request.
   */
  response: RawApiItemResponseConfig | string // identified with `RawApiResponseConfig.model`
}
