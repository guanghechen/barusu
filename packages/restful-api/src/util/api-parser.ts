import {
  cover,
  coverBoolean,
  coverString,
  isArray,
  isNonBlankString,
  isNotEmptyArray,
  isObject,
  isString,
  toKebabCase,
} from '@guanghechen/option-helper'
import type { ValidateFunction } from 'ajv'
import path from 'path'
import { logger } from '../env/logger'
import { loadConfigValidator, loadContextConfig } from '../env/util'
import type { ApiConfig, ApiConfigContext } from '../types/api'
import type { ApiItemConfig } from '../types/api-item'
import type { ApiItemGroupConfig } from '../types/api-item-group'
import type { HttpRequestHeaders, HttpResponseHeaders } from '../types/http'
import { HttpVerb } from '../types/http'
import type { RawApiConfig } from '../types/raw/api'
import type { RawApiItemConfig } from '../types/raw/api-item'
import type { RawApiItemGroupConfig } from '../types/raw/api-item-group'

export class ApiItemParser {
  protected groups: ApiItemGroupConfig[]
  protected readonly schemaRootDir: string
  protected readonly validate: ValidateFunction<RawApiConfig>

  constructor(schemaRootDir?: string) {
    this.groups = []
    this.schemaRootDir = schemaRootDir || ''
    this.validate = loadConfigValidator<RawApiConfig>('api')
  }

  /**
   *
   * @param apiConfigFilePath
   * @param encoding
   */
  public scan(
    apiConfigFilePath: string,
    encoding: BufferEncoding = 'utf-8',
  ): this {
    const self = this
    const apiConfig: ApiConfig = loadContextConfig<RawApiConfig, ApiConfig>({
      validate: self.validate,
      configPath: apiConfigFilePath,
      encoding: encoding,
      preprocess: (json: any) => self.normalizeRawApiConfig(json),
    })
    const apiContext: ApiConfigContext = apiConfig
    for (const rawApiGroup of apiConfig.apis) {
      const apiGroup: ApiItemGroupConfig = this.resolveApiItemGroup(
        rawApiGroup,
        apiContext,
      )
      this.groups.push(apiGroup)
    }
    return this
  }

  /**
   * returns the list of ApiItemGroupConfig parsed by the
   * previous scan operation, and clears this list
   *
   * 返回之前 scan 操作解析得到的 ApiItemGroupConfig 列表，并清除此列表
   */
  public collect(): ApiItemGroupConfig[] {
    return this.groups.splice(0, this.groups.length)
  }

  /**
   * 将 ApiItemGroups 拍平，获得 ApiItemConfig 数组
   * @param activatedOnly   仅返回状态为 active 的 ApiItem
   */
  public collectAndFlat(activatedOnly = true): ApiItemConfig[] {
    const recursiveCollect = (
      apiGroup: ApiItemGroupConfig,
    ): ApiItemConfig[] => {
      const items: ApiItemConfig[] = []
      if (apiGroup.items != null) {
        items.push(...apiGroup.items)
      }
      if (apiGroup.subGroups !== null) {
        for (const subGroup of apiGroup.subGroups) {
          items.push(...recursiveCollect(subGroup))
        }
      }

      if (activatedOnly) return items.filter(item => item.active)
      return items
    }

    const items: ApiItemConfig[] = []
    for (const apiGroup of this.groups) {
      items.push(...recursiveCollect(apiGroup))
    }

    return items
  }

  /**
   * Resolve API items and sub-groups in group.
   *
   * @param rawGroup
   * @param context
   * @param parent
   */
  public resolveApiItemGroup(
    rawGroup: RawApiItemGroupConfig,
    context: ApiConfigContext,
    parent?: ApiItemGroupConfig,
  ): ApiItemGroupConfig {
    // Calc request headers.
    const requestHeaders: HttpRequestHeaders = {
      ...parent?.request.headers,
      ...rawGroup.request?.headers,
    }

    // Calc response headers.
    const responseHeaders: HttpResponseHeaders = {
      ...parent?.response.headers,
      ...rawGroup.response?.headers,
    }

    const prefixPath: string =
      (parent != null ? parent.prefixPath : '') +
      coverString('', rawGroup.prefix)

    const methods: HttpVerb[] = (
      isArray(rawGroup.method)
        ? Array.from(rawGroup.method)
        : ([rawGroup.method] as string[])
    )
      .filter((method): method is HttpVerb => method in HttpVerb)
      .filter((method, index, arr) => {
        for (let i = 0; i < index; ++i) {
          if (arr[i] === method) return false
        }
        return true
      })

    const group: ApiItemGroupConfig = {
      name: rawGroup.name,
      namePath: toKebabCase(
        parent != null ? parent.namePath + '/' + rawGroup.name : rawGroup.name,
      ),
      active: coverBoolean(true, rawGroup.active),
      title: coverString(rawGroup.name, rawGroup.title, isNonBlankString),
      description: coverString('', rawGroup.description, isNonBlankString),
      prefixPath,
      methods: cover<HttpVerb[]>([HttpVerb.GET], methods, isNotEmptyArray),
      request: {
        modelNamePrefix: coverString(
          parent != null ? parent.request.modelNamePrefix : '',
          rawGroup.request?.modelNamePrefix,
        ),
        modelNameSuffix: coverString(
          parent != null ? parent.response.modelNameSuffix : '',
          rawGroup.response?.modelNameSuffix,
        ),
        headers: requestHeaders,
      },
      response: {
        modelNamePrefix: coverString(
          parent != null ? parent.response.modelNamePrefix : '',
          rawGroup.response?.modelNamePrefix,
        ),
        modelNameSuffix: coverString(
          parent != null ? parent.response.modelNameSuffix : '',
          rawGroup.response?.modelNameSuffix,
        ),
        headers: responseHeaders,
      },
      items: [],
      subGroups: [],
    }

    // Resolve items.
    if (rawGroup.items != null) {
      const rawApiItems: RawApiItemConfig[] =
        this.normalizeItems<RawApiItemConfig>(rawGroup.items)
      for (const rawApiItem of rawApiItems) {
        const apiItem = this.resolveApiItem(rawApiItem, context, group)
        group.items.push(apiItem)
      }
    }

    // Resolve sub groups.
    if (rawGroup.subGroups != null) {
      const rawSubGroups: RawApiItemGroupConfig[] =
        this.normalizeItems<RawApiItemGroupConfig>(rawGroup.subGroups)
      for (const rawSubGroup of rawSubGroups) {
        const subGroup = this.resolveApiItemGroup(rawSubGroup, context, group)
        group.subGroups.push(subGroup)
      }
    }

    return group
  }

  /**
   * Resolve API item.
   *
   * @param rawApiItem
   * @param context
   * @param group
   */
  public resolveApiItem(
    rawApiItem: RawApiItemConfig,
    context: ApiConfigContext,
    group?: ApiItemGroupConfig,
  ): ApiItemConfig {
    const { schemaDir } = context
    const resolveSchemaPath = (modelName: string): string => {
      const p = path.join(
        group != null ? group.namePath : '',
        toKebabCase(modelName) + '.json',
      )
      return path.normalize(path.resolve(schemaDir, p))
    }

    // Resolve API item request config.
    const requestConfig: ApiItemConfig['request'] = (() => {
      const headers: HttpRequestHeaders = {
        ...(group == null ? undefined : group.request.headers),
        ...(isObject(rawApiItem.request)
          ? (rawApiItem.request.headers as any)
          : undefined),
      }
      if (
        rawApiItem.request == null ||
        (isObject(rawApiItem.request) && rawApiItem.request.model == null)
      ) {
        return { headers }
      }

      const requestModelName: string = ((): string => {
        const modelName: string = isString(rawApiItem.request)
          ? rawApiItem.request
          : (rawApiItem.request.model as string)
        if (group == null) return modelName

        let result = modelName
        const { modelNamePrefix, modelNameSuffix } = group.request
        if (!modelName.startsWith(modelNamePrefix))
          result = modelNamePrefix + result
        if (!modelName.endsWith(modelNameSuffix))
          result = result + modelNameSuffix
        return result
      })()
      const schemaPath: string = cover<string>(
        (): string => resolveSchemaPath(requestModelName),
        isString(rawApiItem.request)
          ? undefined
          : (rawApiItem.request.schemaPath as string),
        isNonBlankString,
      )

      return { model: requestModelName, schemaPath, headers }
    })()

    // Resolve API item response config.
    const responseConfig: ApiItemConfig['response'] = (() => {
      const responseModelName: string = (() => {
        const modelName = isString(rawApiItem.response)
          ? rawApiItem.response
          : rawApiItem.response.model
        if (group == null) return modelName

        let result = modelName
        const { modelNamePrefix, modelNameSuffix } = group.request
        if (!modelName.startsWith(modelNamePrefix))
          result = modelNamePrefix + result
        if (!modelName.endsWith(modelNameSuffix))
          result = result + modelNameSuffix
        return result
      })()

      const schemaPath: string = cover<string>(
        (): string => resolveSchemaPath(responseModelName),
        isString(rawApiItem.response)
          ? undefined
          : rawApiItem.response.schemaPath,
        isNonBlankString,
      )

      const headers: HttpResponseHeaders = {
        ...(group == null ? undefined : group.response.headers),
        ...(isString(rawApiItem.response)
          ? undefined
          : rawApiItem.response.headers),
      }

      return { model: responseModelName, schemaPath, headers }
    })()

    const routePath: string = (
      group == null || rawApiItem.withoutPrefix
        ? coverString('/', rawApiItem.path)
        : group.prefixPath + coverString('', rawApiItem.path)
    )
      .replace(/[/]+/, '/')
      .replace(/([^/])\/$/, '$1')

    const methods: HttpVerb[] = (
      isArray(rawApiItem.method)
        ? Array.from(rawApiItem.method)
        : ([rawApiItem.method] as string[])
    )
      .filter((method): method is HttpVerb => method in HttpVerb)
      .filter((method, index, arr) => {
        for (let i = 0; i < index; ++i) {
          if (arr[i] === method) return false
        }
        return true
      })

    const apiItem: ApiItemConfig = {
      name: rawApiItem.name,
      active: coverBoolean(true, rawApiItem.active),
      title: coverString(rawApiItem.name, rawApiItem.title, isNonBlankString),
      description: coverString('', rawApiItem.description, isNonBlankString),
      path: routePath,
      methods: cover<HttpVerb[]>(
        group != null ? group.methods : [HttpVerb.GET],
        methods,
        isNotEmptyArray,
      ),
      request: requestConfig,
      response: responseConfig,
    }

    return apiItem
  }

  /**
   * Normalize raw api config data.
   *
   * @param data
   */
  public normalizeRawApiConfig(data: RawApiConfig): RawApiConfig {
    const self = this
    const rawApiGroups: RawApiItemGroupConfig[] = self.normalizeSubGroups(
      data.apis,
    )
    const schemaDir =
      data.schemaDir == null
        ? self.schemaRootDir
        : path.join(self.schemaRootDir, data.schemaDir)
    logger.debug(
      `[ApiParser normalizeApiConfig] data.schemaDir(${data.schemaDir}),` +
        ` this.schemaRootDir(${self.schemaRootDir}), schemaDir(${schemaDir})`,
    )
    return {
      schemaDir,
      apis: rawApiGroups,
    }
  }

  /**
   * Normalize raw API item group config data.
   * @param rawGroups
   */
  private normalizeSubGroups(
    rawGroups: Exclude<RawApiItemGroupConfig['subGroups'], undefined>,
  ): RawApiItemGroupConfig[] {
    const results = this.normalizeItems(rawGroups).map(g => {
      const result = { ...g }

      if (g.items != null) {
        result.items = this.normalizeItems<RawApiItemConfig>(g.items)
      }
      if (g.subGroups != null) {
        result.subGroups = this.normalizeSubGroups(g.subGroups)
      }
      return result
    })
    return results
  }

  /**
   * Normalize API sub-groups or API items.
   * @param rawItems
   */
  private normalizeItems<T extends RawApiItemConfig | RawApiItemGroupConfig>(
    rawItems: T[] | Record<string, Omit<T, 'name'>>,
  ): T[] {
    const items: T[] = []
    if (rawItems == null) return items
    if (isObject(rawItems)) {
      for (const name of Object.getOwnPropertyNames(rawItems)) {
        items.push({ name, ...rawItems[name] } as T)
      }
    } else {
      items.push(...(rawItems as T[]))
    }
    return items
  }
}
