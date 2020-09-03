import fs from 'fs-extra'
import Koa from 'koa'
import send from 'koa-send'
import path from 'path'
import { relativeOfWorkspace } from '@barusu/util-cli'
import { logger } from '../../../env/logger'


interface Params {
  /**
   * Working directory
   */
  workspaceDir: string
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
  { workspaceDir, prefixUrl, mockResourceRootDir }: Params
): Koa.Middleware {
  logger.info(`[serveResourceFile]: mount ${ prefixUrl } --> ${ relativeOfWorkspace(workspaceDir, mockResourceRootDir) }`)
  return async function (ctx: Koa.Context, next: () => Promise<void>): Promise<any> {
    if (ctx.path.startsWith(prefixUrl)) {
      const filepath = ctx.path.slice(prefixUrl.length).replace(/^[/\\]/, '')

      const resolvedFilepath: string | null = (() => {
        const potentialDataPaths = ['']
          .map(ext => filepath + ext)

        for (const p of potentialDataPaths) {
          const absoluteFilepath = path.resolve(mockResourceRootDir, p)
          const relativeFilepath = relativeOfWorkspace(workspaceDir, absoluteFilepath)

          if (fs.existsSync(absoluteFilepath)) {
            logger.debug(`[serveResourceFile hit] try filepath: ${ relativeFilepath }`)
            return p
          }
          logger.debug(`[serveResourceFile miss] try filepath: ${ relativeFilepath }`)
        }
        return null
      })()

      // Hit, return matching static resource file
      if (resolvedFilepath != null) {
        await send(ctx, resolvedFilepath, { root: mockResourceRootDir })
        return
      }
    }

    // No matching static resource file is found,
    // delegated to the next layer of middleware for processing
    await next()
  }
}
