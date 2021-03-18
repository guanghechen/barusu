import type { RawApiItemGroupConfig } from './api-item-group'

/**
 * Type of API configuration.
 * @TJS-additionalProperties false
 */
export interface RawApiConfig {
  /**
   * @description Schema of request / response models root directory
   */
  schemaDir: string
  /**
   * Either an array format or an object format, if it is an object format,
   * the key is the name of the entry.
   * @description API item groups
   */
  apis:
    | RawApiItemGroupConfig[]
    | Record<string, Omit<RawApiItemGroupConfig, 'name'>>
}
