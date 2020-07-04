import {
  AsyncActions,
  AsyncFailedAction,
  AsyncFailureResponse,
  AsyncRequestedAction,
  AsyncSucceedAction,
} from './action'
import { AsyncActionTypes } from './constant'
import { AsyncStateItem } from './state'


export type AsyncActionHandler<SP, A> = (state: AsyncStateItem<SP>, action: A) => AsyncStateItem<SP>


export interface AsyncActionReducer<
  AT extends AsyncActionTypes<string, string, string> | AsyncActionTypes<symbol, symbol, symbol>,
  RP extends unknown = unknown,
  SP extends unknown = unknown,
  FP extends AsyncFailureResponse = AsyncFailureResponse,
  > {
  /**
   * @param state   StateItem
   * @param action  async actions for this state item
   */
  (state: AsyncStateItem<SP>, action: AsyncActions<AT, RP, SP, FP>): AsyncStateItem<SP>
}


/**
 * Reducer of async actions
 * @param actionTypes
 */
export function createAsyncActionReducer<
  AT extends AsyncActionTypes<string, string, string> | AsyncActionTypes<symbol, symbol, symbol>,
  RP extends unknown = unknown,
  SP extends unknown = unknown,
  FP extends AsyncFailureResponse = AsyncFailureResponse,
  >(
    actionTypes: AT,
    onRequestedAction?: AsyncActionHandler<SP, AsyncRequestedAction<AT['REQUEST'], RP>>,
    onSucceedAction?: AsyncActionHandler<SP, AsyncRequestedAction<AT['REQUEST'], SP>>,
    onFailedAction?: AsyncActionHandler<SP, AsyncRequestedAction<AT['REQUEST'], FP>>)
  : AsyncActionReducer<AT, RP, SP, FP> {

  if (onRequestedAction == null) {
    // eslint-disable-next-line no-param-reassign
    onRequestedAction = (state) => {
      return { ...state, loading: true }
    }
  }

  if (onSucceedAction == null) {
    // eslint-disable-next-line no-param-reassign
    onSucceedAction = (state, action) => {
      const { payload } = action
      return {
        ...state,
        loading: false,
        data: payload !== undefined ? payload : null,
        error: null,
      }
    }
  }

  if (onFailedAction == null) {
    // eslint-disable-next-line no-param-reassign
    onFailedAction = (state, action) => {
      const { payload } = action
      return {
        ...state,
        loading: false,
        data: null,
        error: payload !== undefined ? payload : null,
      }
    }
  }

  const reducer: AsyncActionReducer<AT, RP, SP, FP> = (state, action) => {
    switch (action.type) {
      case actionTypes.REQUEST:
        return onRequestedAction!(state, action as AsyncRequestedAction<AT['REQUEST'], RP>)
      case actionTypes.SUCCESS:
        return onSucceedAction!(state, action as AsyncSucceedAction<AT['SUCCESS'], SP>)
      case actionTypes.FAILURE:
        return onFailedAction!(state, action as AsyncFailedAction<AT['FAILURE'], FP>)
      default:
        return state
    }
  }

  return reducer
}
