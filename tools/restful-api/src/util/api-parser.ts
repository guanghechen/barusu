import path from 'path'
import { ConfigurationMaster, TDSchema } from '@barusu/configuration-master'
import {
  coverBoolean,
  coverString,
  isNotEmptyString,
  isObject,
  toKebabCase,
  toPascalCase,
} from '@barusu/util-option'
import { logger } from '../env/logger'
import { loadConfigSchema, loadContextConfig } from '../env/util'
import { ApiConfig, ApiConfigContext, RawApiConfig } from '../types/api-config'
import { RawApiItemGroup } from '../types/api-item-group/raw'
import { ResolvedApiItemGroup } from '../types/api-item-group/resolved'
import { RawApiItem } from '../types/api-item/raw'
import { ResolvedApiItem } from '../types/api-item/resolved'
import {
  HttpRequestHeaders,
  HttpResponseHeaders,
  HttpVerb,
} from '../types/http'


export class ApiItemParser {
  private readonly schemaRootDir: string
  private readonly configurationMaster: ConfigurationMaster
  private readonly schema: TDSchema
  private groups: ResolvedApiItemGroup[]

  public constructor(schemaRootDir?: string, configurationMaster?: ConfigurationMaster) {
    if (configurationMaster == null) {
      // eslint-disable-next-line no-param-reassign
      configurationMaster = new ConfigurationMaster()
      configurationMaster.registerDefaultSchemas()
    }
    this.schemaRootDir = schemaRootDir || ''
    this.configurationMaster = configurationMaster
    this.groups = []

    // load apiConfigSchema
    this.schema = loadConfigSchema(configurationMaster, 'api')
  }

  /**
   *
   * @param apiConfigFilePath
   * @param encoding
   */
  public scan(apiConfigFilePath: string, encoding = 'utf-8'): this {
    const self = this
    const apiConfig: ApiConfig = loadContextConfig<RawApiConfig, ApiConfig>({
      configurationMaster: self.configurationMaster,
      schema: self.schema,
      configPath: apiConfigFilePath,
      encoding: encoding,
      preprocess: (json: any) => self.extractRawApiConfig(json),
    })
    const apiContext: ApiConfigContext = apiConfig
    for (const rawApiGroup of apiConfig.api) {
      const apiGroup: ResolvedApiItemGroup = this.extractRawApiItemGroup(rawApiGroup, apiContext)
      this.groups.push(apiGroup)
    }
    return this
  }

  /**
   * returns the list of ResolvedApiItemGroup parsed by the previous scan operation, and clears this list
   *
   * 返回之前 scan 操作解析得到的 ResolvedApiItemGroup 列表，并清除此列表
   */
  public collect(): ResolvedApiItemGroup[] {
    return this.groups.splice(0, this.groups.length)
  }

  /**
   * 将 ApiItemGroups 拍平，获得 ResolvedApiItem 数组
   * @param activatedOnly   仅返回状态为 active 的 ApiItem
   */
  public collectAndFlat(activatedOnly = true): ResolvedApiItem[] {
    const recursiveCollect = (apiGroup: ResolvedApiItemGroup): ResolvedApiItem[] => {
      const items: ResolvedApiItem[] = []
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

    const items: ResolvedApiItem[] = []
    for (const apiGroup of this.groups) {
      items.push(...recursiveCollect(apiGroup))
    }

    return items
  }

  /**
   *
   * @param data
   */
  public extractRawApiConfig(data: RawApiConfig): ApiConfig {
    const self = this
    const rawApiGroups: RawApiItemGroup[] = self.normalizeGroups(data.api)
    const schemaDir = data.schemaDir == null ? self.schemaRootDir : path.join(self.schemaRootDir, data.schemaDir)
    logger.debug(`[ApiParser extractRawApiConfig] data.schemaDir(${ data.schemaDir }), this.schemaRootDir(${ self.schemaRootDir }), schemaDir(${ schemaDir })`)
    return {
      schemaDir,
      api: rawApiGroups,
    }
  }

  /**
   *
   * @param data
   * @param context
   * @param parent
   */
  public extractRawApiItemGroup(
    data: RawApiItemGroup,
    context: ApiConfigContext,
    parent?: ResolvedApiItemGroup,
  ): ResolvedApiItemGroup {
    const items: ResolvedApiItem[] = []
    const subGroups: ResolvedApiItemGroup[] = []
    const defaultMethod: HttpVerb | undefined = (parent != null && parent.method != null) ? parent.method : undefined
    const rawRequest = data.request || {}
    const rawResponse = data.response || {}

    // calc request model name
    const requestModelNamePrefix: string = coverString(
      parent != null ? parent.request.voNamePrefix: '',
      rawRequest.voNamePrefix)
    const requestModelNameSuffix: string = coverString(
      parent != null ? parent.request.voNameSuffix : 'RequestVo',
      rawRequest.voNameSuffix)

    // calc response model name
    const responseModelNamePrefix: string = coverString(
      parent != null ? parent.response.voNamePrefix: '',
      rawResponse.voNamePrefix)
    const responseModelNameSuffix: string = coverString(
      parent != null ? parent.response.voNameSuffix: 'ResponseVo',
      rawResponse.voNameSuffix)

    // calc request headers
    const requestHeaders = (
      (parent != null && parent.request.headers != null)
      || (rawRequest.headers != null)
    )
      ? { ...(parent != null ? parent.request.headers : undefined), ...rawRequest.headers }
      : undefined

    // calc response headers
    const responseHeaders = (
      (parent != null && parent.response.headers != null)
      || (rawResponse.headers != null)
    )
      ? { ...(parent != null ? parent.response.headers : undefined), ...rawResponse.headers }
      : undefined

    const group: ResolvedApiItemGroup = {
      name: data.name,
      fullName: toKebabCase(parent != null ? parent.fullName + '/' + data.name : data.name),
      active: coverBoolean(true, data.active),
      title: coverString(data.name, data.title, isNotEmptyString),
      desc: coverString(data.desc || '', data.description, isNotEmptyString),
      path: (parent != null ? parent.path : '') + data.path,
      method: coverString(defaultMethod as any, data.method, isNotEmptyString) as HttpVerb,
      request: {
        voNamePrefix: requestModelNamePrefix,
        voNameSuffix: requestModelNameSuffix,
        headers: requestHeaders,
      },
      response: {
        voNamePrefix: responseModelNamePrefix,
        voNameSuffix: responseModelNameSuffix,
        headers: responseHeaders,
      },
      items,
      subGroups,
    }

    // extract items
    if (data.items != null) {
      const rawApiItems: RawApiItem[] = this.normalizeItems<RawApiItem>(data.items)
      for (const rawApiItem of rawApiItems) {
        const ResolvedApiItem = this.extractRawApiItem(rawApiItem, context, group)
        items.push(ResolvedApiItem)
      }
    }

    // recursive extract
    if (data.subGroups != null) {
      const rawSubGroups: RawApiItemGroup[] = this.normalizeItems<RawApiItemGroup>(data.subGroups)
      for (const rawSubGroup of rawSubGroups) {
        const subGroup = this.extractRawApiItemGroup(rawSubGroup, context, group)
        subGroups.push(subGroup)
      }
    }

    return group
  }

  /**
   *
   * @param data
   * @param context
   * @param group
   */
  public extractRawApiItem(data: RawApiItem, context: ApiConfigContext, group?: ResolvedApiItemGroup): ResolvedApiItem {
    // preprocess
    const rawRequest: {
      voName?: string,
      voFullName?: string,
      schemaPath?: string
      headers?: HttpRequestHeaders,
    } = {}
    const rawResponse: {
      voName?: string,
      voFullName?: string,
      schemaPath?: string
      headers?: HttpResponseHeaders,
    } = {}

    if (typeof data.request === 'string') {
      // eslint-disable-next-line no-param-reassign
      rawRequest.voFullName = data.request
    } else if (data.request != null) {
      const { voName, voFullName, schemaPath, headers } = data.request as typeof rawRequest
      rawRequest.voName = voName
      rawRequest.voFullName = voFullName
      rawRequest.schemaPath = schemaPath
      rawRequest.headers = headers
    }
    if (typeof data.response === 'string') {
      // eslint-disable-next-line no-param-reassign
      rawResponse.voFullName = data.response
    } else if (data.request != null) {
      const { voName, voFullName, schemaPath, headers } = data.response as typeof rawResponse
      rawResponse.voName = voName
      rawResponse.voFullName = voFullName
      rawResponse.schemaPath = schemaPath
      rawResponse.headers = headers
    }

    const { schemaDir } = context
    const fullGroupName = group != null ? toPascalCase(group.fullName.replace(/\//g, '-')) : ''
    const defaultPath: string = group != null ? group.path + (data.path || '') : (data.path || '')
    const defaultMethod: HttpVerb = (group != null && group.method != null) ? group.method : HttpVerb.GET

    // calc schema path
    const resolveSchemaPath = (modelName: string) => {
      // eslint-disable-next-line no-param-reassign
      modelName = toKebabCase(modelName)
      const p = path.join(group != null ? group.fullName : '', modelName + '.json')
      return path.normalize(path.resolve(schemaDir, p))
    }

    // calc request model name
    const requestModelNameMiddle: string = coverString(
      group != null ? fullGroupName + '-' + data.name : data.name,
      rawRequest.voName,
      isNotEmptyString)
    const defaultRequestModelName: string = (group != null)
      ? group.request.voNamePrefix + '-' + requestModelNameMiddle + '-' + group.request.voNameSuffix
      : requestModelNameMiddle
    const requestModelName = toPascalCase(
      coverString(defaultRequestModelName, rawRequest.voFullName, isNotEmptyString))
    const requestSchemaPath = resolveSchemaPath(requestModelName)

    // calc response model name
    const responseModelNameMiddle: string = coverString(
      group != null ? fullGroupName + '-' + data.name : data.name,
      rawResponse.voName,
      isNotEmptyString)
    const defaultResponseModelName: string = (group != null)
      ? group.response.voNamePrefix + '-' + responseModelNameMiddle + '-' + group.response.voNameSuffix
      : responseModelNameMiddle
    const responseModelName = toPascalCase(
      coverString(defaultResponseModelName, rawResponse.voFullName, isNotEmptyString))
    const responseSchemaPath = resolveSchemaPath(responseModelName)

    // calc request headers
    const requestHeaders: HttpRequestHeaders | undefined = (
      (group != null && group.request.headers != null) || (rawRequest.headers != null)
    ) ? { ...(group != null ? group.request.headers : undefined), ...rawRequest.headers }
      : undefined

    // calc response headers
    const responseHeaders: HttpResponseHeaders | undefined = (
      (group != null && group.response.headers != null) || (rawResponse.headers != null)
    ) ? { ...(group != null ? group.response.headers : undefined), ...rawResponse.headers }
      : undefined

    const ResolvedApiItem: ResolvedApiItem = {
      name: data.name,
      active: coverBoolean(true, data.active),
      title: coverString(data.name, data.title, isNotEmptyString),
      desc: coverString(data.desc || '', data.description, isNotEmptyString),
      path: coverString(defaultPath, data.fullPath, isNotEmptyString),
      method: coverString(defaultMethod || HttpVerb.GET, data.method, isNotEmptyString) as HttpVerb,
      request: (isObject(rawRequest) && rawRequest.voName == null && rawRequest.voFullName == null)
        ? { headers: requestHeaders }
        : {
          voName: requestModelName,
          schemaPath: requestSchemaPath,
          headers: requestHeaders,
        },
      response: {
        voName: responseModelName,
        schemaPath: responseSchemaPath,
        headers: responseHeaders,
      }
    }

    return ResolvedApiItem
  }

  /**
   *
   * @param rawGroups
   */
  private normalizeGroups<T extends RawApiItemGroup>(
    rawGroups: T[] | { [name: string]: Omit<T, 'name'> }
  ): T[] {
    const self = this
    // eslint-disable-next-line no-param-reassign
    rawGroups = this.normalizeItems(rawGroups)
    return rawGroups.map(g => {
      if (g.items != null) {
        // eslint-disable-next-line no-param-reassign
        g.items = self.normalizeItems<RawApiItem>(g.items)
      }
      if (g.subGroups != null) {
        // eslint-disable-next-line no-param-reassign
        g.subGroups = self.normalizeGroups<RawApiItemGroup>(g.subGroups)
      }
      return g
    })
  }

  /**
   *
   * @param rawItems
   */
  private normalizeItems<T extends (RawApiItem | RawApiItemGroup)>(
    rawItems: T[] | { [name: string]: Omit<T, 'name'> }
  ): T[] {
    const items: T[] = []
    if (rawItems == undefined) return items
    if (isObject(rawItems)) {
      for (const name of Object.getOwnPropertyNames(rawItems)) {
        items.push({ name, ...rawItems[name] } as T)
      }
    } else {
      items.push(...rawItems as T[])
    }
    return items
  }
}
