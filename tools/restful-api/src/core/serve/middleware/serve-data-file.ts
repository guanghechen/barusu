import fs from 'fs-extra'
import Koa from 'koa'
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
   * The root dirpath of mock data
   */
  mockDataRootDir: string
}

/**
 * Serve resource file under <mockDataRootDir>
 */
export function serveDataFile({
  workspaceDir,
  prefixUrl,
  mockDataRootDir,
}: Params): Koa.Middleware {
  logger.info(
    `[serveDataFile]: mount ${prefixUrl} --> ${relativeOfWorkspace(
      workspaceDir,
      mockDataRootDir,
    )}`,
  )
  return async function (
    ctx: Koa.Context,
    next: () => Promise<void>,
  ): Promise<any> {
    if (ctx.path.startsWith(prefixUrl)) {
      const method = ctx.method
      const filepath = ctx.path.slice(prefixUrl.length).replace(/^[/\\]/, '')

      const resolvedFilepath: string | null = (() => {
        const potentialDataPaths = [
          '__' + method,
          '__' + method + '.json',
          '',
          '.json',
        ].map(ext => filepath + ext)

        for (const p of potentialDataPaths) {
          const absoluteFilepath = path.resolve(mockDataRootDir, p)
          const relativeFilepath = relativeOfWorkspace(
            workspaceDir,
            absoluteFilepath,
          )

          if (fs.existsSync(absoluteFilepath)) {
            logger.debug(
              `[serveDataFile hit] try filepath: ${relativeFilepath}`,
            )
            return p
          }
          logger.debug(`[serveDataFile miss] try filepath: ${relativeFilepath}`)
        }
        return null
      })()

      // Hit, parse the content of the data file into json,
      // and return the json data
      if (resolvedFilepath != null) {
        try {
          const absoluteFilepath = path.resolve(
            mockDataRootDir,
            resolvedFilepath,
          )
          const data = await fs.readJSON(absoluteFilepath)
          // eslint-disable-next-line no-param-reassign
          ctx.body = data
        } catch {
          logger.error(`${resolvedFilepath} is not a valid json file.`)
        }
        return
      }
    }

    // No matching static resource file is found,
    // delegated to the next layer of middleware for processing
    await next()
  }
}
