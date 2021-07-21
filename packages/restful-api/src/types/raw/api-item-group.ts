import type { HttpRequestHeaders, HttpResponseHeaders, HttpVerb } from '../http'
import type { RawApiItemConfig } from './api-item'

/**
 * Type of API item group configuration that written by the user.
 * @TJS-additionalProperties false
 */
export interface RawApiItemGroupConfig {
  /**
   * @description API item group name.
   */
  name: string
  /**
   * @description Whether the API item group is active.
   * @default true
   */
  active?: boolean
  /**
   * @description API item group title.
   * @default @name
   */
  title?: string
  /**
   * @description API item group description.
   */
  description?: string
  /**
   * @description The prefix route path of all the API item in the group.
   * @default
   */
  prefix?: string
  /**
   * @description Default HTTP method types of all the API item in the group.
   * @default 'GET'
   */
  method?: HttpVerb | HttpVerb[]
  /**
   * All descendant nodes will be affected.
   * @description Configuration of the request object in an HTTP request.
   */
  request?: {
    /**
     * @description Prefix name of the request model name, will override the parent group one.
     * @default
     */
    modelNamePrefix?: string
    /**
     * This property will override the ones defined in the ancestor group.
     * Th All of the items or sub-groups of this group
     * This property
     * @description Suffix name of the request model name of all items and sub-group items, will override the parent group one.
     * @default
     */
    modelNameSuffix?: string
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
  response?: {
    /**
     * @description Prefix name of the response model name, will override the parent group one.
     * @default
     */
    modelNamePrefix?: string
    /**
     * This property will override the ones defined in the ancestor group.
     * Th All of the items or sub-groups of this group
     * This property
     * @description Suffix name of the response model name of all items and sub-group items, will override the parent group one.
     * @default ResponseVo
     */
    modelNameSuffix?: string
    /**
     * This property will merge all the ones defined in the ancestor groups.
     * @description HTTP response headers.
     */
    headers?: HttpResponseHeaders
  }
  /**
   * Either an array format or an object format, if it is an object format,
   * the key is the name of the entry.
   * @description Sub API groups.
   */
  subGroups?:
    | RawApiItemGroupConfig[]
    | Record<string, Omit<RawApiItemGroupConfig, 'name'>>
  /**
   * Either an array format or an object format, if it is an object format,
   * the key is the name of the entry.
   * @description API items in the group.
   */
  items?: RawApiItemConfig[] | Record<string, Omit<RawApiItemConfig, 'name'>>
}
