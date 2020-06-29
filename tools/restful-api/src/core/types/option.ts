import { CoverOperationFunc } from 'option-master'


/**
 * 选项条目
 */
export interface CmdOptionItem<T> {
  /**
   * 参数的值
   */
  value: T
  /**
   * 是否是用户指定的（用于区分默认值）
   */
  userSpecified: boolean
  /**
   *
   */
  coverFunc?: CoverOperationFunc<T>
}


/**
 * 命令行参数
 */
export interface CmdOptions {
  [key: string]: (
    | CmdOptionItem<string>
    | CmdOptionItem<string | undefined>
    | CmdOptionItem<boolean>
    | CmdOptionItem<boolean | undefined>
    | CmdOptionItem<number>
    | CmdOptionItem<number | undefined>
  )
}


/**
 * 全局参数
 */
export interface GlobalCmdOptions extends CmdOptions {
  /**
   * 执行命令所在的目录
   */
  cwd: CmdOptionItem<string>
  /**
   * 此命令工具的版本号
   */
  version: CmdOptionItem<string>
  /**
   * 全局配置文件所在路径
   * @default app.yml
   */
  configPath: CmdOptionItem<string>
  /**
   * api 条目配置文件（夹）所在路径
   * @default api.yml
   */
  apiConfigPath: CmdOptionItem<string>
  /**
   * Json-Schema 存放的文件夹根目录
   * @default schemas
   */
  schemaRootPath: CmdOptionItem<string>
  /**
   * 目标工程的文件编码（简单起见，只考虑所有的源码使用同一种编码格式）
   * @default utf-8
   */
  encoding: CmdOptionItem<string>
  /**
   * 日志的级别
   * @default info
   */
  logLevel: CmdOptionItem<string>
}


/**
 * 子命令 generate 的参数
 */
export interface GenerateCmdOptions extends CmdOptions {
  /**
   * tsconfig.json 所在的路径
   * @default tsconfig.json
   */
  tsconfigPath: CmdOptionItem<string>
  /**
   * 忽略未找到的模型，若为 false，则抛出异常，并终止程序
   * @default false
   */
  ignoreMissingModels: CmdOptionItem<boolean>
  /**
   * 在生成 JSON-SCHEMA 之前，是否先清空新生成 JSON-SCHEMA 待存放的文件夹
   * @default false
   */
  clean: CmdOptionItem<boolean>
}


/**
 * 子命令 serve 的参数
 */
export interface ServeCmdOptions extends CmdOptions {
  /**
   * tsconfig.json 所在的路径
   * @default 127.0.0.1
   */
  host: CmdOptionItem<string>
  /**
   * 忽略未找到的模型，若为 false，则抛出异常，并终止程序
   * @default 8080
   */
  port: CmdOptionItem<number>
  /**
   *  数据文件所在的根目录
   * @default
   */
  mockDataFileRootPath: CmdOptionItem<string | undefined>
  /**
   * 是否优先使用数据文件作为 mock 数据
   * @default false
   */
  mockDataFileFirst: CmdOptionItem<boolean>
  /**
   * 是否只返回 JSON-SCHEMA 中 required 的属性
   * @default false
   */
  mockRequiredOnly: CmdOptionItem<boolean>
  /**
   * 是否始终都返回所有的非 required 的属性
   * @default false
   */
  mockOptionalsAlways: CmdOptionItem<boolean>
  /**
   * 返回数据中，包含非 required 的属性的几率
   * @default 0.8
   */
  mockOptionalsProbability: CmdOptionItem<number>
}


/**
 * 子命令 init 的参数
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface InitCmdOptions extends CmdOptions {
}
