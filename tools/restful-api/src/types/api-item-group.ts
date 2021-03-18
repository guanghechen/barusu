import type { ApiItemConfig } from './api-item'
import type { HttpRequestHeaders, HttpResponseHeaders, HttpVerb } from './http'

/**
 * Type of API item group configuration.
 */
export interface ApiItemGroupConfig {
  /**
   * @description API item group name.
   */
  name: string
  /**
   * @description API item group name path (prefix with the ancestor groups).
   */
  namePath: string
  /**
   * @description Whether the API item group is active.
   * @default true
   */
  active: boolean
  /**
   * @description API item group title.
   * @default @name
   */
  title: string
  /**
   * @description API item group description.
   */
  description: string
  /**
   * @description The prefix route path of all the API items in the group.
   * @default
   */
  prefixPath: string
  /**
   * @description Default HTTP method types of all the API item in the group.
   */
  methods: HttpVerb[]
  /**
   * All descendant nodes will be affected.
   * @description Configuration of the request object in an HTTP request.
   */
  request: {
    /**
     * @description Prefix name of the request model name, will override the parent group one.
     * @default
     */
    modelNamePrefix: string
    /**
     * This property will override the ones defined in the ancestor group.
     * Th All of the items or sub-groups of this group
     * This property
     * @description Suffix name of the request model name of all items and sub-group items, will override the parent group one.
     * @default
     */
    modelNameSuffix: string
    /**
     * This property will merge all the ones defined in the ancestor groups.
     * @description HTTP request headers.
     */
    headers?: HttpRequestHeaders
  }
  /**
   * All descendant nodes will be affected.
   * @description Configuration of the response object in an HTTP request.
   */
  response: {
    /**
     * @description Prefix name of the response model name, will override the parent group one.
     * @default
     */
    modelNamePrefix: string
    /**
     * This property will override the ones defined in the ancestor group.
     * Th All of the items or sub-groups of this group
     * This property
     * @description Suffix name of the response model name of all items and sub-group items, will override the parent group one.
     * @default ResponseVo
     */
    modelNameSuffix: string
    /**
     * This property will merge all the ones defined in the ancestor groups.
     * @description HTTP response headers.
     */
    headers?: HttpResponseHeaders
  }
  /**
   * @description Sub API groups.
   */
  subGroups: ApiItemGroupConfig[]
  /**
   * @description API items in the group.
   */
  items: ApiItemConfig[]
}
