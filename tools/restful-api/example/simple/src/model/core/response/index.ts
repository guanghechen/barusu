/**
 * response code
 */
export enum ResponseCode {
  /**
   * 200 OK
   */
  S_OK = 200,
}


/**
 * response result
 */
export interface ResponseResult<T = undefined> {
  /**
   * response code
   * @default 200
   */
  code: ResponseCode
  /**
   * response message
   */
  message: string
  /**
   * response data
   */
  result?: T
}


/**
 * 分页响应数据
 */
export interface PaginationResponseResult<T = undefined> extends ResponseResult<T> {
  /**
   * pagination info
   */
  pagination: {
    /**
     * current page
     * @TJS-type integer
     * @minimum 1
     */
    current: number
    /**
     * number of records per page
     * @minimum 10
     * @maximum 100
     * @TJS-type integer
     */
    size: number
    /**
     * total records
     * @TJS-type integer
     * @minimum 1
     */
    total: number
  }
}
