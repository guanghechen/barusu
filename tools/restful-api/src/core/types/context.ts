import ts from 'typescript'
import * as TJS from '@lemon-clown/typescript-json-schema'


/**
 * 全局选项配置
 */
export interface GlobalContextConfig {
  /**
   * 执行命令所在的目录
   */
  cwd: string
  /**
   * 当前命令的版本号
   */
  version: string
  /**
   * api 条目配置文件（夹）所在路径
   * @default api.yml
   */
  apiConfigPath: string
  /**
   * Json-Schema 存放的文件夹根目录
   * @default schemas
   */
  schemaRootPath: string
  /**
   * 目标工程的文件编码（简单起见，只考虑所有的源码使用同一种编码格式）
   * @default utf-8
   */
  encoding: string
  /**
   * 日志的级别
   * @default info
   */
  logLevel: 'debug' | 'verbose' | 'info' | 'warn' | 'error'
}


/**
 * generate 子命令的上下文配置
 */
export interface GenerateContextConfig {
  /**
   * tsconfig.json 所在的路径
   * @default tsconfig.json
   */
  tsconfigPath: string
  /**
   * 忽略未找到的模型，若为 false，则抛出异常，并终止程序
   * @default false
   */
  ignoreMissingModels: boolean
  /**
   * 在生成 JSON-SCHEMA 之前，是否先清空新生成 JSON-SCHEMA 待存放的文件夹
   * @default false
   */
  clean: boolean
  /**
   * 忽略指定类型的数据模型
   * JSON-Schema 对象树中的节点，`type` 值在 `ignoredDataTypes` 中时，则以该节点为根节点所在的子树将被忽略
   */
  ignoredDataTypes?: string[]
  /**
   * 定义 ApiItems 的文件路径（yaml/json 格式）
   * 若指定的是目录，则目录下的所有 .api.yml/.api.yaml/.api.json 为后缀的文件
   * 均视为 ApiItems 的配置文件
   */
  apiConfigPath?: string
  /**
   * 生成的 Json-Schema 存放的文件夹根目录（绝对路径或相对于 tsconfig.json 所在的路径）
   * 可覆盖 globalOption.encoding 的值
   */
  schemaRootPath?: string
  /**
   * 目标工程的文件编码（简单起见，只考虑所有的源码使用同一种编码格式）
   * 可覆盖 globalOption.encoding 的值
   */
  encoding?: string
  /**
   * 额外的构建 Schema 的选项
   */
  schemaArgs?: TJS.PartialArgs
  /**
   * 额外的 CompilerOptions 选项
   */
  additionalCompilerOptions?: ts.CompilerOptions
}



/**
 * serve 子命令的上下文配置
 */
export interface ServeContextConfig {
  /**
   * mock-server 监听的地址：ip/域名
   * @default 127.0.0.1
   */
  host: string
  /**
   * mock-server 监听的端口
   * @TJS-number
   * @minimum 0
   * @maximum 65535
   * @default 8080
   */
  port: number
  /**
   * mock serve 的路由前缀
   * @default
   */
  prefixUrl: string
  /**
   * 定义 ApiItems 的文件路径（yaml/json 格式）
   * 若指定的是目录，则目录下的所有 .api.yml/.api.yaml/.api.json 为后缀的文件
   * 均视为 ApiItems 的配置文件
   */
  apiConfigPath?: string
  /**
   * 生成的 Json-Schema 存放的文件夹根目录（绝对路径或相对于 tsconfig.json 所在的路径）
   * 可覆盖 globalOption.encoding 的值
   */
  schemaRootPath?: string
  /**
   * 目标工程的文件编码（简单起见，只考虑所有的源码使用同一种编码格式）
   * 可覆盖 globalOption.encoding 的值
   */
  encoding?: string
  /**
   * 是否只返回 JSON-SCHEMA 中 required 的属性
   * @default false
   */
  mockRequiredOnly: boolean
  /**
   * 是否始终都返回所有的非 required 的属性
   * @default false
   */
  mockOptionalsAlways: boolean
  /**
   * 返回数据中，包含非 required 的属性的几率
   * @default 0.8
   */
  mockOptionalsProbability: number
  /**
   * 是否优先使用数据文件作为 mock 数据
   * @default false
   */
  mockDataFileFirst: boolean
  /**
   * mock 数据文件所在的根目录
   */
  mockDataFileRootPath?: string
}


/**
 * init 子命令的上下文配置
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface InitContextConfig {
}


/**
 * 上下文配置
 */
export interface AppContextConfig {
  /**
   * 命令的全局选项配置
   */
  globalOptions?: GlobalContextConfig
  /**
   * 子命令 generate 选项配置
   */
  generate?: GenerateContextConfig
  /**
   * 子命令 serve 选项配置
   */
  serve?: ServeContextConfig
  /**
   * 子命令 init 选项配置
   */
  init?: InitContextConfig
}
