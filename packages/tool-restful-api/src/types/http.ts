/**
 * HTTP methods
 */
export enum HttpVerb {
  /**
   * HTTP Get method
   */
  GET = 'GET',
  /**
   * HTTP Post method
   */
  POST = 'POST',
  /**
   * HTTP Put method
   */
  PUT = 'PUT',
  /**
   * HTTP Patch method
   */
  PATCH = 'PATCH',
  /**
   * HTTP Delete method
   */
  DELETE = 'DELETE',
}

/**
 * HTTP Headers
 */
export type HttpHeaders = Record<string, string | number>

/**
 * HTTP Request Headers
 */
export type HttpRequestHeaders = HttpHeaders

/**
 * HTTP Response Headers
 */
export type HttpResponseHeaders = HttpHeaders
