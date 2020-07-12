declare module '@koa/cors' {
  import Application from 'koa'

  export interface CorsParams {
    /**
     * `Access-Control-Allow-Origin`, default is request Origin header
     */
    origin?: string | ((ctx: Application.ParameterizedContext) => string)
    /**
     * `Access-Control-Allow-Methods`, default is 'GET,HEAD,PUT,POST,DELETE,PATCH'
     */
    allowMethods?: string | string[]
    /**
     * `Access-Control-Expose-Headers`
     */
    exposeHeaders?: string | string[]
    /**
     * `Access-Control-Allow-Headers`
     */
    allowHeaders?: string | string[]
    /**
     * `Access-Control-Max-Age` in seconds
     */
    maxAge?: string | number
    /**
     * `Access-Control-Allow-Credentials`
     */
    credentials?: boolean
    /**
     * Add set headers to `err.header` if an error is thrown
     */
    keepHeadersOnError?: boolean
  }

  export default function (params?: CorsParams): Application.Middleware
}
