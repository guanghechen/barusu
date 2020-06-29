import path from 'path'
import { coverString, isObject, toPascalCase, toKebabCase, OptionMaster, TDSchema } from 'option-master'
import { ApiItemGroup, RawApiItemGroup } from './types/api-item-group'
import { RawApiItem, ApiItem, HttpVerb } from './types/api-item'
import { RawApiConfig, ApiConfig, ApiConfigContext } from './types/api-config'
import { loadContextConfig, loadConfigSchema } from './util/context-util'
import { logger } from './util/logger'


export class ApiItemParser {
  private readonly schemaRootDir: string
  private readonly optionMaster: OptionMaster
  private readonly schema: TDSchema
  private groups: ApiItemGroup[]

  public constructor(schemaRootDir?: string, optionMaster?: OptionMaster) {
    if (optionMaster == null) {
      optionMaster = new OptionMaster()
      optionMaster.registerDefaultSchemas()
    }
    this.schemaRootDir = schemaRootDir || ''
    this.optionMaster = optionMaster
    this.groups = []

    // load apiConfigSchema
    this.schema = loadConfigSchema(optionMaster, 'api')
  }

  /**
   *
   * @param apiConfigFilePath
   * @param encoding
   */
  public scan(apiConfigFilePath: string, encoding = 'utf-8'): this {
    const self = this
    const apiConfig: ApiConfig = loadContextConfig<RawApiConfig, ApiConfig>({
      optionMaster: self.optionMaster,
      schema: self.schema,
      configPath: apiConfigFilePath,
      encoding: encoding,
      preprocess: (json: any) => self.extractRawApiConfig(json),
    })
    const apiContext: ApiConfigContext = apiConfig
    for (const rawApiGroup of apiConfig.api) {
      const apiGroup: ApiItemGroup = this.extractRawApiItemGroup(rawApiGroup, apiContext)
      this.groups.push(apiGroup)
    }
    return this
  }

  /**
   * returns the list of ApiItemGroup parsed by the previous scan operation, and clears this list
   *
   * 返回之前 scan 操作解析得到的 ApiItemGroup 列表，并清除此列表
   */
  public collect(): ApiItemGroup[] {
    return this.groups.splice(0, this.groups.length)
  }

  /**
   * 将 ApiItemGroups 拍平，获得 ApiItem 数组
   */
  public collectAndFlat(): ApiItem[] {
    const recursiveCollect = (apiGroup: ApiItemGroup): ApiItem[] => {
      const items: ApiItem[] = []
      if (apiGroup.items != null) {
        items.push(...apiGroup.items)
      }
      if (apiGroup.subGroups !== null) {
        for (const subGroup of apiGroup.subGroups) {
          items.push(...recursiveCollect(subGroup))
        }
      }
      return items
    }

    const items: ApiItem[] = []
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
  public extractRawApiItemGroup(data: RawApiItemGroup, context: ApiConfigContext, parent?: ApiItemGroup): ApiItemGroup {
    const items: ApiItem[] = []
    const subGroups: ApiItemGroup[] = []
    const defaultMethod: HttpVerb | undefined = (parent != null && parent.method != null) ? parent.method : undefined

    // calc request model name
    const requestModelNamePrefix: string = coverString(
      parent != null ? parent.request.modelNamePrefix : '',
      data.request.modelNamePrefix).value!
    const requestModelNameSuffix: string = coverString(
      parent != null ? parent.request.modelNameSuffix : 'RequestVo',
      data.request.modelNameSuffix).value!

    // calc response model name
    const responseModelNamePrefix: string = coverString(
      parent != null ? parent.response.modelNamePrefix : '',
      data.response.modelNamePrefix).value!
    const responseModelNameSuffix: string = coverString(
      parent != null ? parent.response.modelNameSuffix : 'ResponseVo',
      data.response.modelNameSuffix).value!

    // calc response headers
    const responseHeaders = ((parent != null && parent.response.headers != null) || (data.response.headers != null))
      ? { ...(parent != null ? parent.response.headers : undefined), ...data.response.headers }
      : undefined

    const group: ApiItemGroup = {
      name: data.name,
      fullName: toKebabCase(parent != null ? parent.fullName + '/' + data.name : data.name),
      title: coverString(data.name, data.title).value!,
      description: data.description,
      path: (parent != null ? parent.path : '') + data.path,
      method: coverString(defaultMethod, data.method).value as HttpVerb,
      request: {
        modelNamePrefix: requestModelNamePrefix,
        modelNameSuffix: requestModelNameSuffix,
      },
      response: {
        modelNamePrefix: responseModelNamePrefix,
        modelNameSuffix: responseModelNameSuffix,
        headers: responseHeaders,
      },
      items,
      subGroups,
    }

    // extract items
    if (data.items != null) {
      const rawApiItems: RawApiItem[] = this.normalizeItems<RawApiItem>(data.items)
      for (const rawApiItem of rawApiItems) {
        const apiItem = this.extractRawApiItem(rawApiItem, context, group)
        items.push(apiItem)
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
  public extractRawApiItem(data: RawApiItem, context: ApiConfigContext, group?: ApiItemGroup): ApiItem {
    // preprocess
    if (typeof data.request === 'string') data.request = { fullModelName: data.request }
    else if (data.request == null) data.request = {}
    if (typeof data.response === 'string') data.response = { fullModelName: data.response }
    else if (data.response == null) data.request = {}

    const { schemaDir } = context
    const fullGroupName = group != null ? toPascalCase(group.fullName.replace(/\//g, '-')) : ''
    const defaultPath: string = group != null ? group.path + data.path : data.path
    const defaultMethod: HttpVerb = (group != null && group.method != null) ? group.method : HttpVerb.GET

    // calc schema path
    const resolveSchemaPath = (modelName: string) => {
      modelName = toKebabCase(modelName)
      const p = path.join(group != null ? group.fullName : '', modelName + '.json')
      return path.normalize(path.resolve(schemaDir, p))
    }

    // calc request model name
    const requestModelNameMiddle: string = coverString(
      group != null ? fullGroupName + '-' + data.name : data.name,
      data.request.model).value!
    const defaultRequestModelName: string = (group != null)
      ? group.request.modelNamePrefix + '-' + requestModelNameMiddle + '-' + group.request.modelNameSuffix
      : requestModelNameMiddle
    const requestModelName = toPascalCase(coverString(defaultRequestModelName, data.request.fullModelName).value!)
    const requestSchemaPath = resolveSchemaPath(requestModelName)

    // calc response model name
    const responseModelNameMiddle: string = coverString(
      group != null ? fullGroupName + '-' + data.name : data.name,
      data.response.model).value!
    const defaultResponseModelName: string = (group != null)
      ? group.response.modelNamePrefix + '-' + responseModelNameMiddle + '-' + group.response.modelNameSuffix
      : responseModelNameMiddle
    const responseModelName = toPascalCase(coverString(defaultResponseModelName, data.response.fullModelName).value!)
    const responseSchemaPath = resolveSchemaPath(responseModelName)

    // calc response headers
    const responseHeaders = ((group != null && group.response.headers != null) || (data.response.headers != null))
      ? { ...(group != null ? group.response.headers : undefined), ...(data.response as any).headers }
      : undefined

    const apiItem: ApiItem = {
      name: data.name,
      title: coverString(data.name, data.title).value!,
      description: data.description,
      path: coverString(defaultPath, data.fullPath).value!,
      method: coverString(defaultMethod, data.method).value as HttpVerb,
      request: {
        model: requestModelName,
        schema: requestSchemaPath,
      },
      response: {
        model: responseModelName,
        schema: responseSchemaPath,
        headers: responseHeaders,
      }
    }

    return apiItem
  }

  /**
   *
   * @param rawGroups
   */
  private normalizeGroups<T extends RawApiItemGroup>(rawGroups: T[] | { [name: string]: Omit<T, 'name'> }): T[] {
    const self = this
    rawGroups = this.normalizeItems(rawGroups)
    return rawGroups.map(g => {
      if (g.items != null) g.items = self.normalizeItems<RawApiItem>(g.items)
      if (g.subGroups != null) g.subGroups = self.normalizeGroups<RawApiItemGroup>(g.subGroups)
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
        items.push({ name, ...rawItems[name] })
      }
    } else {
      items.push(...rawItems as T[])
    }
    return items
  }
}
