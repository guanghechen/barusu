import {
  AsyncActions,
  AsyncFailedAction,
  AsyncFailureResponse,
  AsyncRequestedAction,
  AsyncSucceedAction,
} from './action'
import { AsyncActionCreator, createAsyncActionCreator } from './creator'
import {
  AsyncActionHandler,
  AsyncActionReducer,
  createAsyncActionReducer,
} from './reducer'
import { AsyncStateItem } from './state'
export * from './action'
export * from './creator'
export * from './reducer'
export * from './state'


/**
 * Shorthand for create both AsyncActionCreator and AsyncActionReducer
 * @param actionType
 * @param handlers
 */
export function createAsyncAction<
  S extends AsyncStateItem<unknown>,
  T extends string | symbol,
  RP extends unknown = unknown,
  SP extends unknown = unknown,
  FP extends AsyncFailureResponse = AsyncFailureResponse
>(
  actionType: T,
  handlers?: {
    onRequestedAction?: AsyncActionHandler<S, AsyncRequestedAction<T, RP>>,
    onSucceedAction?: AsyncActionHandler<S, AsyncSucceedAction<T, SP>>,
    onFailedAction?: AsyncActionHandler<S, AsyncFailedAction<T, FP>>,
  },
): {
  creator: AsyncActionCreator<T, RP, SP, FP>,
  reducer: AsyncActionReducer<S, T, AsyncActions<T, RP, SP, FP>>
} {
  const creator = createAsyncActionCreator<T, RP, SP, FP>(actionType)
  const reducer = createAsyncActionReducer<S, T, RP, SP, FP>(actionType, handlers)
  return { creator, reducer }
}
