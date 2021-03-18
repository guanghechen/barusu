import type { ApiItemGroupConfig } from './api-item-group'

/**
 * Type of API configuration.
 */
export interface ApiConfig {
  /**
   * @description Schema of request / response models root directory
   */
  schemaDir: string
  /**
   * @description API item groups
   */
  apis: ApiItemGroupConfig[]
}

/**
 * Context type of API configuration.
 */
export interface ApiConfigContext {
  /**
   * @description Schema of request / response models root directory
   */
  schemaDir: string
}
