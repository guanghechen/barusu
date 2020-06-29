import fs from 'fs-extra'
import path from 'path'
import Koa from 'koa'
import { logger } from '../../core/util/logger'


interface Params {
  /**
   * 请求的 url 前缀
   */
  prefixUrl: string
  /**
   * 是否优先使用数据文件作为 mock 数据源
   */
  mockDataFileFirst: boolean
  /**
   * mock 数据文件所在的根目录
   */
  mockDataFileRootPath: string
}


/**
 * 以 <dataFileRootPath> 下的 json 文件作为优先数据源
 */
export function dataFileMock({ prefixUrl, mockDataFileFirst, mockDataFileRootPath }: Params) {
  return async function (ctx: Koa.Context, next: Function) {
    // 以数据文件作为 mock 数据源
    const loadFromDataFile = async () => {
      let u = ctx.path.startsWith(prefixUrl) ? ctx.path.slice(prefixUrl.length) : ctx.path
      u = u.replace(/^[/\\]+/, '').replace(/[/\\]+$/, '')
      const dataPath = path.join(mockDataFileRootPath, u)
      const data = await loadMockData(dataPath)
      return data
    }

    // 以路由（jsf）作为 mock 数据源
    const loadFromNext = async () => {
      const data = await next()
      return data
    }

    // 调整 mock 数据源的优先顺序
    const methods = mockDataFileFirst ? [loadFromDataFile, loadFromNext] : [loadFromNext, loadFromDataFile]

    // 尝试所有可行的方式，值得返回非 null 的结果
    for (const method of methods) {
      const data = await method()
      if (data != null) {
        ctx.body = data
        return
      }
    }
  }
}


/**
 * 加载数据文件作为 mock 数据；会依次尝试原文件名、json 后缀的文件名
 * @param dataPath  mock 数据所在的地址； json 格式
 */
async function loadMockData<T = any>(dataPath: string): Promise<T | null> {
  const resolvePath = (p: string) => {
    if (fs.existsSync(p)) return p
    if (fs.existsSync(p + '.json')) return p + '.json'
    return null
  }

  const realDataPath = resolvePath(dataPath)
  if (realDataPath == null) return null
  try {
    const data = await fs.readJSON(realDataPath)
    return data
  } catch {
    logger.error(`${ realDataPath } is not a json file.`)
    return null
  }
}
