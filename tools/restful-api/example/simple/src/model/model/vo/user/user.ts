import { User } from '../../user/user'
import { ResponseResult } from '../../../core/response'


/**
 * update current user information
 */
export interface UpdateCurrentUserRequestVo extends User {}
export type UpdateCurrentUserResponseVo = ResponseResult<undefined>


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
