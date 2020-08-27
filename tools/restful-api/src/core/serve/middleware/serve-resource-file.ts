import fs from 'fs-extra'
import Koa from 'koa'
import send from 'koa-send'
import path from 'path'


interface Params {
  /**
   * Url prefix in request
   */
  prefixUrl: string
  /**
   * The root filepath of static resource files
   */
  mockResourceRootDir: string
}


/**
 * Serve resource file under <mockResourceRootDir>
 */
export function serveResourceFile(
  { prefixUrl, mockResourceRootDir }: Params
): Koa.Middleware {
  return async function (ctx: Koa.Context, next: () => Promise<void>): Promise<any> {
    const filepath = ctx.path.startsWith(prefixUrl)
      ? ctx.path.slice(prefixUrl.length)
      : ctx.path
    const absoluteFilepath = path.resolve(
      mockResourceRootDir,
      filepath.replace(/^[/\\]+/, '').replace(/[/\\]+$/, ''))

    // Hit, return matching static resource file
    if (fs.existsSync(absoluteFilepath)) {
      await send(ctx, absoluteFilepath)
      return
    }

    // No matching static resource file is found,
    // delegated to the next layer of middleware for processing
    await next()
  }
}
