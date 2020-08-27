import fs from 'fs-extra'
import Koa from 'koa'
import path from 'path'
import { logger } from '../../../util/logger'


interface Params {
  /**
   * Url prefix in request
   */
  prefixUrl: string
  /**
   * The root dirpath of mock data
   */
  mockDataRootDir: string
}


/**
 * Serve resource file under <mockDataRootDir>
 */
export function serveDataFile(
  { prefixUrl, mockDataRootDir }: Params
): Koa.Middleware {
  return async function (ctx: Koa.Context, next: () => Promise<void>): Promise<any> {
    const method = ctx.method
    const filepath = ctx.path.startsWith(prefixUrl)
      ? ctx.path.slice(prefixUrl.length)
      : ctx.path
    const absoluteFilepath: string | null = (() => {
      const potentialDataPaths = [
        '__' + method,
        '__' + method + '.json',
        '',
        '.json',
      ].map(ext => path.resolve(mockDataRootDir, filepath + ext))

      for (const p of potentialDataPaths) {
        if (fs.existsSync(p)) return p
      }
      return null
    })()

    // Hit, parse the content of the data file into json, and return the json data
    if (absoluteFilepath != null) {
      try {
        const data = await fs.readJSON(absoluteFilepath)
        // eslint-disable-next-line no-param-reassign
        ctx.body = data
      } catch {
        logger.error(`${ absoluteFilepath } is not a valid json file.`)
      }
      return
    }

    // No matching static resource file is found,
    // delegated to the next layer of middleware for processing
    await next()
  }
}
