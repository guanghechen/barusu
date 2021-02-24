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
export interface HttpHeaders {
  /**
   *
   */
  [key: string]: string | number
}

/**
 * HTTP Request Headers
 */
export interface HttpRequestHeaders extends HttpHeaders {}

/**
 * HTTP Response Headers
 */
export interface HttpResponseHeaders extends HttpHeaders {}
