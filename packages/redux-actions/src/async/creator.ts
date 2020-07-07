import {
  AsyncFailedAction,
  AsyncFailureResponse,
  AsyncRequestedAction,
  AsyncSucceedAction,
} from './action'
import { AsyncActionStatus } from './constant'


/**
 * Creators of async actions
 */
export interface AsyncActionCreator<
  T extends string | symbol,
  RP extends unknown,
  SP extends unknown,
  FP extends AsyncFailureResponse,
  > {
  /**
   * Requested action creator
   */
  request: (payload?: RP) => AsyncRequestedAction<T, RP>
  /**
   * Succeed action creator
   */
  success: (payload: SP) => AsyncSucceedAction<T, SP>
  /**
   * Failed action creator
   */
  failure: (payload: FP) => AsyncFailedAction<T, FP>
}


/**
 * Create async action types and async action creators
 *
 * # Examples
 *
 *    const creators = createAsyncActionCreators<
 *      '@user/fetch_user', { id: number }, { name: string }>('@user/fetch_user')
 *    // => { request(...), success(...), failure(...) }
 *
 *    // request
 *    creators.request({ id: 2 })
 *
 *    // request succeed
 *    creators.succeed({ name: 'lemon-clown' })
 *
 * @param actionTypes
 */
export function createAsyncActionCreator<
  T extends string | symbol,
  RP extends unknown = unknown,
  SP extends unknown = unknown,
  FP extends AsyncFailureResponse = AsyncFailureResponse
>(
  actionType: T
): AsyncActionCreator<T, RP, SP, FP> {
  /**
   * Requested action creator
   */
  const createRequestAction = (payload?: RP): AsyncRequestedAction<T, RP> => {
    return { type: actionType, status: AsyncActionStatus.REQUESTED, payload }
  }

  /**
   * Succeed action creator
   */
  const createSuccessAction = (payload: SP): AsyncSucceedAction<T, SP> => {
    return { type: actionType, status: AsyncActionStatus.SUCCEED, payload }
  }

  /**
   * Failure action creator
   */
  const createFailureAction = (payload: FP): AsyncFailedAction<T, FP> => {
    return { type: actionType, status: AsyncActionStatus.FAILED, payload }
  }

  // Action creators
  const ActionCreators = {
    request: createRequestAction,
    success: createSuccessAction,
    failure: createFailureAction,
  }

  return ActionCreators
}
