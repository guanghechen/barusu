/* eslint-disable @typescript-eslint/no-var-requires */
import chalk from 'chalk'
import fs from 'fs-extra'
import http from 'http'
import Koa from 'koa'
import koaJson from 'koa-json'
import Router from 'koa-router'
import { isFile } from '../core/util/fs-util'
import { logger } from '../core/util/logger'
import { RestfulApiToolServerContext } from './context'
import { accessLog } from './middleware/access-log'
import { dataFileMock } from './middleware/data-file-mock'


const koaCors = require('@koa/cors')
const jsf = require('json-schema-faker')


/**
 * 生成 JSON-Schema 的工具类
 */
export class RestfulApiToolServer {
  protected readonly context: RestfulApiToolServerContext
  protected readonly routers: Router[]
  protected server: http.Server | null
  protected running: boolean

  public constructor(context: RestfulApiToolServerContext) {
    this.context = context
    this.routers = []
    this.server = null
    this.running = false
    jsf.option({
      requiredOnly: context.mockRequiredOnly,
      alwaysFakeOptionals: context.mockOptionalsAlways,
      optionalsProbability: context.mockOptionalsProbability,
    })

    // debug logger
    logger.debug('[context] cwd:', context.cwd)
    logger.debug('[context] projectRootPath:', context.projectRootPath)
    logger.debug('[context] schemaRootPath:', context.schemaRootPath)
    logger.debug('[context] encoding:', context.encoding)
    logger.debug('[context] host:', context.host)
    logger.debug('[context] port:', context.port)
    logger.debug('[context] prefixUrl:', context.prefixUrl)
    logger.debug('[context] mockRequiredOnly:', context.mockRequiredOnly)
    logger.debug('[context] mockOptionalsAlways:', context.mockOptionalsAlways)
    logger.debug('[context] mockOptionalsProbability:', context.mockOptionalsProbability)
    logger.debug('[context] mockDataFileFirst:', context.mockDataFileFirst)
    logger.debug('[context] mockDataFileRootPath:', context.mockDataFileRootPath)
  }

  /**
   * start server
   */
  public async start(): Promise<void> {
    const { host, port, prefixUrl, mockDataFileFirst, mockDataFileRootPath } = this.context
    const app = new Koa()

    app
      .use(accessLog())
      .use(koaCors())
      .use(koaJson())

    // 如果指定了 mockDataFileRootPath，则将文件数据源作为一种 mock 数据源
    if (mockDataFileRootPath != null) {
      app.use(dataFileMock({ prefixUrl, mockDataFileFirst, mockDataFileRootPath }))
    }

    // run custom router first
    for (const router of this.routers) {
      // print routing information
      for (const layer of router.stack) {
        for (const method of layer.methods) {
          if (method === 'HEAD') continue
          logger.info(`load router: ${ method.padEnd(6) } ${ layer.path }`)
        }
      }
      app
        .use(router.routes())
        .use(router.allowedMethods())
    }

    // run generated router from api-items
    // don't execute `this.routers.push(await this.generateRoutes())`,
    // as `this.start` may be called in multiple times.
    const router = await this.generateRoutes()
    app
      .use(router.routes())
      .use(router.allowedMethods())

    // start server
    const server = app.listen(port, host, () => {
      const url = `http://${ host }:${ port }`
      const address = JSON.stringify(server.address())
      logger.info(`address: ${ address }`)
      logger.info(`listening on ${ url }`)
    })

    this.server = server
  }

  /**
   * stop server
   */
  public stop(): void {
    if (this.server != null) {
      logger.info('server closing...')
      this.server.close()
      this.server = null
      this.running = false
    }
  }

  /**
   * register custom router
   * @param router
   */
  public registerRouter (router: Router): void {
    if (this.running) {
      logger.warn('mock server has been started, reject new routes')
      return
    }
    this.routers.push(router)
  }

  /**
   * generate router from api-items
   */
  private async generateRoutes(): Promise<Router> {
    const { encoding, prefixUrl, apiItems } = this.context
    const router = new Router({ prefix: prefixUrl })
    for (const item of apiItems) {
      logger.info(`load router: ${ item.method.padEnd(6) } ${ prefixUrl }${ item.path }  ${ chalk.gray('(' + (item.response.model || '') + ')') }`)
      router.register(item.path, [item.method], [
        async (ctx: Router.RouterContext) => {
          const schemaPath = item.response.schema
          if (!(await isFile(schemaPath))) {
            throw new Error(`bad schema: ${ schemaPath } is not found.`)
          }
          const schemaContent: string = await fs.readFile(schemaPath, encoding)
          const schema = JSON.parse(schemaContent)
          const data = jsf.generate(schema)
          // eslint-disable-next-line no-param-reassign
          ctx.body = data
        }
      ])
    }
    return router
  }
}
