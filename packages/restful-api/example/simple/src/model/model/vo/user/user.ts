import { OptionalResponseResult, ResponseResult } from '../../../core/response'
import { User } from '../../user/user'


/**
 * update current user information
 */
export interface UpdateCurrentUserRequestVo extends User {}
export type UpdateCurrentUserResponseVo = OptionalResponseResult<undefined>


/**
 * get current user information
 */
export type QueryCurrentUserResponseVo = ResponseResult<User>


/**
 * login
 */
export interface UserLoginRequestVo {
  /**
   * name of the account
   */
  username: string
  /**
   * password of the account
   */
  password: string
}
export type UserLoginResponseVo = ResponseResult<User>
