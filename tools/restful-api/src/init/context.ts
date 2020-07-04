import path from 'path'
import { GlobalContextConfig, InitContextConfig } from '../core/types/context'


/**
 * 生成器的上下文信息
 *
 * @member cwd                  执行命令所在的目录
 * @member projectRootPath      待处理的目标工程路径（传进来的参数中，tsconfigPath 所在的目录）
 * @member tsconfigPath         tsconfig.json 所在的路径
 * @member schemaRootPath       生成的 Json-Schema 存放的文件夹（绝对路径）
 * @member apiConfigPath        api 条目配置文件（夹）所在路径
 * @member encoding             目标工程的文件编码（简单起见，只考虑所有的源码使用同一种编码格式）；默认值为 utf-8
 * @member globalOptions        全局上下文配置
 */
export class RestfulApiToolInitiatorContext {
  public readonly cwd: string
  public readonly projectRootPath: string
  public readonly tsConfigPath: string
  public readonly apiConfigPath: string
  public readonly schemaRootPath: string
  public readonly encoding: string
  public readonly globalOptions: GlobalContextConfig

  public constructor(projectRootPath: string, options: GlobalContextConfig, params: InitContextConfig) {
    const { cwd, encoding } = options
    let { apiConfigPath, schemaRootPath } = options
    const {} = params
    let tsconfigPath = 'tsconfig.json'

    tsconfigPath = path.resolve(projectRootPath, tsconfigPath)
    schemaRootPath = path.resolve(projectRootPath, schemaRootPath)
    apiConfigPath = path.resolve(projectRootPath, apiConfigPath)

    this.cwd = cwd
    this.projectRootPath = projectRootPath
    this.tsConfigPath = tsconfigPath
    this.schemaRootPath = schemaRootPath
    this.apiConfigPath = apiConfigPath
    this.encoding = encoding
    this.globalOptions = options
  }
}
