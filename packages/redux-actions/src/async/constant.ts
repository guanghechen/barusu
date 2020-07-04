/**
 * Types of async actions
 */
export interface AsyncActionTypes<
  RT extends string | symbol,
  ST extends string | symbol,
  FT extends string | symbol,
  > {
  /**
   * Requested action type
   */
  REQUEST: RT
  /**
   * Succeed action type
   */
  SUCCESS: ST
  /**
   * Failed action type
   */
  FAILURE: FT
}


/**
 * Create async action types
 * # Examples
 *
 *    const types = createAsyncActions('@user/info')
 *    // => types = {
 *    //      REQUEST: '@user/info/REQUEST',
 *    //      SUCCESS: '@user/info/SUCCESS',
 *    //      FAILURE: '@user/info/FAILURE', }
 *
 * @param requestType
 * @param successType
 * @param failureType
 */
export function createAsyncActionTypes<
  RT extends string = string,
  ST extends string = string,
  FT extends string = string,
  >(
    requestType: RT,
    successType: ST,
    failureType: FT,
): AsyncActionTypes<typeof requestType, typeof successType, typeof failureType>
export function createAsyncActionTypes<
  RT extends symbol = symbol,   // unique symbol recommended
  ST extends symbol = symbol,   // unique symbol recommended
  FT extends symbol = symbol,   // unique symbol recommended
  >(
    requestType: RT,
    successType: ST,
    failureType: FT,
): AsyncActionTypes<typeof requestType, typeof successType, typeof failureType>
export function createAsyncActionTypes(
  name: string,
): AsyncActionTypes<string, string, string>
export function createAsyncActionTypes<
  RT extends string,
  ST extends string,
  FT extends string,
  >(
    nameOrRequestType: RT,
    successType?: ST,
    failureType?: FT
): AsyncActionTypes<RT, ST, FT> | AsyncActionTypes<string, string, string> {
  /**
   * Requested action type
   */
  const REQUEST_ACTION_TYPE = successType != null ? nameOrRequestType : nameOrRequestType + '/REQUEST'
  type REQUEST_ACTION_TYPE = typeof REQUEST_ACTION_TYPE extends RT ? RT : string

  /**
   * Succeed action type
   */
  const SUCCESS_ACTION_TYPE = successType != null ? successType : nameOrRequestType + '/SUCCESS'
  type SUCCESS_ACTION_TYPE = typeof SUCCESS_ACTION_TYPE extends ST ? ST : string

  /**
   * Failed action type
   */
  const FAILURE_ACTION_TYPE = failureType != null ? failureType : nameOrRequestType + '/FAILURE'
  type FAILURE_ACTION_TYPE = typeof FAILURE_ACTION_TYPE extends FT ? FT : string

  // Action types
  const ActionTypes = {
    REQUEST: REQUEST_ACTION_TYPE,
    SUCCESS: SUCCESS_ACTION_TYPE,
    FAILURE: FAILURE_ACTION_TYPE,
  }

  return ActionTypes
}
