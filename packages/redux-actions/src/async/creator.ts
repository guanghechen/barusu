import {
  AsyncFailedAction,
  AsyncFailureResponse,
  AsyncRequestedAction,
  AsyncSucceedAction,
} from './action'
import { AsyncActionTypes } from './constant'


/**
 * Creators of async actions
 */
export interface AsyncActionCreators<
  AT extends AsyncActionTypes<string, string, string> | AsyncActionTypes<symbol, symbol, symbol> ,
  RP extends unknown,
  SP extends unknown,
  FP extends AsyncFailureResponse,
  > {
  /**
   * Requested action creator
   */
  request: (payload?: RP) => AsyncRequestedAction<AT['REQUEST'], RP>
  /**
   * Succeed action creator
   */
  success: (payload: SP) => AsyncSucceedAction<AT['SUCCESS'], SP>
  /**
   * Failed action creator
   */
  failure: (payload: FP) => AsyncFailedAction<AT['FAILURE'], FP>
}


/**
 * Create async action types and async action creators
 *
 * # Examples
 *
 *    const types = createAsyncActionTypes('@user/info')
 *    // => types = {
 *    //      REQUEST = '@user/info/REQUEST',
 *    //      SUCCESS: '@user/info/SUCCESS',
 *    //      FAILURE: '@user/info/FAILURE', }*
 *
 *    const creators = createAsyncActionCreators<{ id: number }, { data: string }>(actionTypes)
 *    //    creators = { request(...), success(...), failure(...) }
 *
 *    // request
 *    creators.request({ id: 2 })
 *
 *    // request succeed
 *    creators.succeed({ data: 'lemon-clown' })
 *
 * @param actionTypes
 */
export function createAsyncActionCreators<
  AT extends AsyncActionTypes<string, string, string> | AsyncActionTypes<symbol, symbol, symbol> ,
  RP extends unknown = unknown,
  SP extends unknown = unknown,
  FP extends AsyncFailureResponse = AsyncFailureResponse,
  >(actionTypes: AT)
  : AsyncActionCreators<AT, RP, SP, FP> {
  /**
   * Requested action
   */
  type RequestActionPayload = RP
  type RequestAction = AsyncRequestedAction<AT['REQUEST'], RequestActionPayload>

  /**
   * Succeed action
   */
  type SuccessActionPayload = SP
  type SuccessAction = AsyncSucceedAction<AT['SUCCESS'], SuccessActionPayload>

  /**
   * Failed action
   */
  type FailureActionPayload = FP
  type FailureAction = AsyncFailedAction<AT['FAILURE'], FailureActionPayload>

  /**
   * Requested action creator
   */
  const createRequestAction = (payload?: RequestActionPayload): RequestAction => {
    return { type: actionTypes.REQUEST, payload }
  }

  /**
   * Succeed action creator
   */
  const createSuccessAction = (payload: SuccessActionPayload): SuccessAction => {
    return { type: actionTypes.SUCCESS, payload }
  }

  /**
   * Failure action creator
   */
  const createFailureAction = (payload: FailureActionPayload): FailureAction => {
    return { type: actionTypes.FAILURE, payload }
  }

  // Action creators
  const ActionCreators = {
    request: createRequestAction,
    success: createSuccessAction,
    failure: createFailureAction,
  }

  return ActionCreators
}
