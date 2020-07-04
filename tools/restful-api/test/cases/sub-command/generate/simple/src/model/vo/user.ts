import { ResponseResult } from '../core/response'


/**
 * 登录请求对象
 */
export interface UserLoginRequestVo {
  /**
   * 登录账号
   */
  username: string
  /**
   * 登录密码
   */
  password: string
}


/**
 * 登录响应对象
 */
export type UserLoginResponseVo = ResponseResult<{
  /**
   * 校验身份的令牌
   */
  token: string
  /**
   * 登录账号
   */
  username: string
}>


/**
 * 退出登录请求对象
 */
export interface UserLogoutRequestVo {
  /**
   * 校验身份的令牌
   */
  token: string
}


/**
 * 退出登录响应对象
 */
export type UserLogoutResponseVo = ResponseResult


/**
 * 获取当前用户信息的请求对象
 */
export interface CurrentUserInfoRequestModel {
  /**
   * 校验身份的令牌
   */
  token: string
}


/**
 * 获取当前用户信息的响应对象
 */
export type CurrentUserInfoResponseModel = ResponseResult<{
  /**
   * 用户名称
   */
  username: string
  /**
   * 性别
   */
  gender?: 'male' | 'female'
  /**
   * 年龄
   */
  age?: number
}>


/**
 * 获取指定用户信息的请求对象
 */
export interface UserInfoOoRequestVo {
  /**
   * 用户 id
   */
  uid: string
}


/**
 * 获取指定用户信息的响应对象
 */
export type XxUserInfoOoResponseVo = CurrentUserInfoResponseModel
