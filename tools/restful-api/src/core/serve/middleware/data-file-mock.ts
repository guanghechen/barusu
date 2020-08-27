import fs from 'fs-extra'
import Koa from 'koa'
import path from 'path'
import { logger } from '../../../util/logger'


interface Params {
  /**
   * 请求的 url 前缀
   */
  prefixUrl: string
  /**
   * mock 数据文件所在的根目录
   */
  mockDataFileRootPath: string
}


/**
 * 以 <dataFileRootPath> 下的 json 文件作为优先数据源
 */
export function dataFileMock({ prefixUrl, mockDataFileRootPath }: Params) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return async function (ctx: Koa.Context, next: Function): Promise<any> {
    // 以数据文件作为 mock 数据源
    const loadFromDataFile = async () => {
      let u = ctx.path.startsWith(prefixUrl) ? ctx.path.slice(prefixUrl.length) : ctx.path
      u = u.replace(/^[/\\]+/, '').replace(/[/\\]+$/, '')
      const dataPath = path.join(mockDataFileRootPath, u)
      const data = await loadMockData(ctx.method, dataPath)
      return data
    }

    // 以路由（jsf）作为 mock 数据源
    const loadFromNext = async () => {
      const data = await next()
      return data
    }

    // 调整 mock 数据源的优先顺序
    const mockProviders = [loadFromDataFile, loadFromNext]

    // 尝试所有可行的方式，值得返回非 null 的结果
    for (const mockProvider of mockProviders) {
      const data = await mockProvider()
      if (data != null) {
        // eslint-disable-next-line no-param-reassign
        ctx.body = data
        return
      }
    }
  }
}


/**
 * 加载数据文件作为 mock 数据；会依次尝试原文件名、json 后缀的文件名
 * @param method    http verb
 * @param dataPath  filepath of mock data, format with json
 */
async function loadMockData<T = any>(
  method: string,
  dataPath: string
): Promise<T | null> {
  const resolvePath = (p: string) => {
    const potentialDataPaths = [
      '__' + method,
      '__' + method + '.json',
      '',
      '.json',
    ].map(x => p + x)

    for (const x of potentialDataPaths) {
      if (fs.existsSync(x)) return x
    }
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
