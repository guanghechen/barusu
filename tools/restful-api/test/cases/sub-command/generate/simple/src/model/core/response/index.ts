import { ResponseCode } from './code'
export { ResponseCode } from './code'


/**
 * 响应数据
 */
export interface ResponseResult<T = undefined> {
  /**
   * 响应码
   * @default 200
   */
  code: ResponseCode
  /**
   * 响应消息
   */
  message: string
  /**
   * 响应结果
   */
  result?: T
}


/**
 * 分页响应数据
 */
export interface PaginationResponseResult<T = undefined> {
  /**
   * 响应码
   */
  code: ResponseCode
  /**
   * 响应消息
   * @default 200
   */
  message: string
  /**
   * 响应结果
   */
  result?: {
    /**
     * 数据列表
     */
    records: T[]
    /**
      * 当前页页号
      *
      * @minimum 1
      * @TJS-type integer
      */
    current: number
    /**
     * 当前页大小
     *
     * @minimum 10
     * @maximum 100
     * @TJS-type integer
     */
    size: number
    /**
     * 数据总数
     *
     * @minimum 0
     * @TJS-type integer
     */
    total: number
  }
}
