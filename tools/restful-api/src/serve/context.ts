import path from 'path'
import { ApiItemParser } from '../core/api-parser'
import { ApiItem } from '../core/types/api-item'
import { GlobalContextConfig, ServeContextConfig } from '../core/types/context'
import { extractApiItemPath } from '../core/util/context-util'
import { logger } from '../core/util/logger'
import { stringify } from '../core/util/type-util'


/**
 * mock server 的上下文信息
 * @member cwd                      执行命令所在的目录
 * @member projectRootDir           待处理的目标工程路径（传进来的参数中，tsconfigPath 所在的目录）
 * @member schemaRootPath           生成的 Json-Schema 存放的文件夹（绝对路径）
 * @member encoding                 目标工程的文件编码（简单起见，只考虑所有的源码使用同一种编码格式）；默认值为 utf-8
 * @member host                     mock-server 监听的地址：ip/域名
 * @member port                     mock-server 监听的端口
 * @member prefixUrl                mock serve 的路由前缀
 * @member mockRequiredOnly         是否只返回 JSON-SCHEMA 中 required 的属性
 * @member mockOptionalsAlways      是否始终都返回所有的非 required 的属性
 * @member mockOptionalsProbability 返回数据中，包含非 required 的属性的几率
 * @member mockDataFileFirst        是否优先使用数据文件作为 mock 数据
 * @member mockDataFileRootPath     mock 数据文件所在的根目录
 * @member apiItems                 ApiItem 列表
 */
export class RestfulApiToolServerContext {
  public readonly cwd: string
  public readonly projectRootPath: string
  public readonly schemaRootPath: string
  public readonly encoding: string
  public readonly host: string
  public readonly port: number
  public readonly prefixUrl: string
  public readonly mockRequiredOnly: boolean
  public readonly mockOptionalsAlways: boolean
  public readonly mockOptionalsProbability: number
  public readonly mockDataFileFirst: boolean
  public readonly mockDataFileRootPath?: string
  public readonly apiItems: ApiItem[]

  public constructor(projectRootPath: string, options: GlobalContextConfig, params: ServeContextConfig) {
    const {
      cwd,
      apiConfigPath: defaultApiConfigPath,
      schemaRootPath: defaultSchemaRootPath,
      encoding: defaultEncoding,
    } = options
    const {
      host,
      port,
      prefixUrl,
      encoding = defaultEncoding,
      mockDataFileFirst,
      mockRequiredOnly,
      mockOptionalsAlways,
      mockOptionalsProbability,
    } = params
    let {
      schemaRootPath = defaultSchemaRootPath,
      apiConfigPath = defaultApiConfigPath,
      mockDataFileRootPath,
    } = params

    schemaRootPath = path.resolve(projectRootPath, schemaRootPath)
    apiConfigPath = path.resolve(projectRootPath, apiConfigPath)
    if (mockDataFileRootPath != null) {
      mockDataFileRootPath= path.resolve(projectRootPath, mockDataFileRootPath)
    }

    this.cwd = cwd
    this.projectRootPath = projectRootPath
    this.schemaRootPath = schemaRootPath
    this.encoding = encoding
    this.host = host
    this.port = port
    this.prefixUrl = prefixUrl
    this.mockRequiredOnly = mockRequiredOnly
    this.mockOptionalsAlways = mockOptionalsAlways
    this.mockOptionalsProbability = mockOptionalsProbability
    this.mockDataFileFirst = mockDataFileFirst
    this.mockDataFileRootPath = mockDataFileRootPath

    const apiItemParser = new ApiItemParser(this.schemaRootPath)
    const apiConfigPaths: string[] = extractApiItemPath(apiConfigPath)
    for (const apiConfigPath of apiConfigPaths) {
      apiItemParser.scan(apiConfigPath)
    }

    const apiItems = apiItemParser.collectAndFlat()
    if (apiItems.length <= 0) {
      logger.debug(`[RestfulApiToolServeContext.constructor] option(${ stringify(options) }) params(${ stringify(params) }):`)
      throw new Error('no valid api item found.')
    }

    this.apiItems = apiItems
  }
}
