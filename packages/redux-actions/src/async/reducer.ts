import {
  AsyncActions,
  AsyncFailedAction,
  AsyncFailureResponse,
  AsyncRequestedAction,
  AsyncSucceedAction,
} from './action'
import { AsyncActionStatus } from './constant'
import { AsyncStateItem } from './state'


export type AsyncActionHandler<
  S extends AsyncStateItem<unknown>,
  A extends AsyncActions<symbol | string>,
  > = (state: S, action: A) => S


type Reducer<
  S extends AsyncStateItem<unknown>,
  A extends AsyncActions<symbol | string>,
  > = AsyncActionHandler<S, A>


export interface AsyncActionReducer<
  S extends AsyncStateItem<unknown>,
  T extends string | symbol,
  A extends AsyncActions<T>,
  > {
  /**
   * Accepted action type
   */
  readonly actionType: T
  /**
   * @param state   StateItem
   * @param action  async actions for this state item
   */
  process: AsyncActionHandler<S, A>
}


/**
 * Create reducer of async actions
 * @param actionType
 */
export function createAsyncActionReducer<
  S extends AsyncStateItem<unknown>,
  T extends string | symbol,
  RP extends unknown = unknown,
  SP extends unknown = unknown,
  FP extends AsyncFailureResponse = AsyncFailureResponse
>(
  actionType: T,
  handlers: {
    onRequestedAction?: AsyncActionHandler<S, AsyncRequestedAction<T, RP>>,
    onSucceedAction?: AsyncActionHandler<S, AsyncSucceedAction<T, SP>>,
    onFailedAction?: AsyncActionHandler<S, AsyncFailedAction<T, FP>>,
  } = {},
): AsyncActionReducer<S, T, AsyncActions<T, RP, SP, FP>> {

  /**
   * Requested action handler
   */
  const onRequestedAction: AsyncActionHandler<S, AsyncRequestedAction<T, RP>> =
    handlers.onRequestedAction != null
      ? handlers.onRequestedAction
      : (state) => {
        return {
          ...state,
          loading: true
        }
      }

  /**
   * Succeed action handler
   */
  const onSucceedAction: AsyncActionHandler<S, AsyncSucceedAction<T, SP>> =
    handlers.onSucceedAction != null
      ? handlers.onSucceedAction
      : (state, action) => {
        const { payload } = action
        return {
          ...state,
          loading: false,
          data: payload !== undefined ? payload : null,
          error: null,
        }
      }

  /**
   * Failed action handler
   */
  const onFailedAction: AsyncActionHandler<S, AsyncFailedAction<T, FP>> =
    handlers.onFailedAction != null
      ? handlers.onFailedAction
      : (state, action) => {
        const { payload } = action
        return {
          ...state,
          loading: false,
          data: null,
          error: payload !== undefined ? payload : null,
        }
      }

  const actionReducer: AsyncActionReducer<S, T, AsyncActions<T, RP, SP, FP>> = {
    actionType,
    process: function (state: S, action: AsyncActions<T, RP, SP, FP>) {
      if (action.type !== actionType) return state
      switch (action.status) {
        case AsyncActionStatus.REQUESTED:
          return onRequestedAction!(state, action)
        case AsyncActionStatus.SUCCEED:
          return onSucceedAction!(state, action)
        case AsyncActionStatus.FAILED:
          return onFailedAction!(state, action)
        default:
          return state
      }
    }
  }

  return actionReducer
}


/**
 * Create redux reducer
 *
 * @param initialState
 * @param actionReducers
 */
export function assembleActionReducers<
  S extends AsyncStateItem<unknown> = AsyncStateItem<any>,
  T extends string | symbol = any,
  R extends AsyncActionReducer<S, T, AsyncActions<T>> = AsyncActionReducer<S, T, AsyncActions<any, any, any>>
>(
  initialState: S,
  actionReducers: R[],
): Reducer<S, AsyncActions<T, unknown>> {
  return (state: S = initialState, action: AsyncActions<T, unknown>): S => {
    for (const reducer of actionReducers) {
      if (reducer.actionType === action.type) {
        return reducer.process(state, action)
      }
    }
    return state
  }
}
