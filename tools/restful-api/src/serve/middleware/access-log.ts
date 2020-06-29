import Koa from 'koa'
import { logger } from '../../core/util/logger'


/**
 * print access log
 */
export function accessLog(): Koa.Middleware<any, any> {
  return async function (ctx: Koa.Context, next: Function) {
    const { ip, method, originalUrl } = ctx
    const requestTime = Date.now()
    logger.verbose(`<-- [${ ip }] ${ method } ${ originalUrl }`)

    await next()

    const { status } = ctx
    const delta = Date.now() - requestTime
    logger.verbose(`--> [${ ip }] ${ method } ${ originalUrl } ${ status } ${ delta }ms.`)
  }
}
