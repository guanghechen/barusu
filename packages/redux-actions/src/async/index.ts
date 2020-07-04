import { AsyncFailureResponse, AsyncRequestedAction } from './action'
import { AsyncActionTypes, createAsyncActionTypes } from './constant'
import { AsyncActionCreators, createAsyncActionCreators } from './creator'
import {
  AsyncActionHandler,
  AsyncActionReducer,
  createAsyncActionReducer,
} from './reducer'
import { AsyncStateItem, createInitAsyncStateItem } from './state'
export * from './action'
export * from './constant'
export * from './creator'
export * from './reducer'
export * from './state'


export function createAsyncStateItem<
  RP extends unknown = unknown,
  SP extends unknown = unknown,
  FP extends AsyncFailureResponse = AsyncFailureResponse,
  >(
    name: string,
    data?: SP | null,
    onRequestedAction?: AsyncActionHandler<SP, AsyncRequestedAction<string, RP>>,
    onSucceedAction?: AsyncActionHandler<SP, AsyncRequestedAction<string, SP>>,
    onFailedAction?: AsyncActionHandler<SP, AsyncRequestedAction<string, FP>>)
  : {
    types: AsyncActionTypes<string, string, string>,
    creators: AsyncActionCreators<AsyncActionTypes<string, string, string>, RP, SP, FP>
    reducer: AsyncActionReducer<AsyncActionTypes<string, string, string>, RP, SP, FP>
    initialState: AsyncStateItem<SP>
  }
export function createAsyncStateItem<
  AT extends AsyncActionTypes<string, string, string> | AsyncActionTypes<symbol, symbol, symbol>,
  RP extends unknown = unknown,
  SP extends unknown = unknown,
  FP extends AsyncFailureResponse = AsyncFailureResponse,
  >(
    types: AT,
    data?: SP | null,
    onRequestedAction?: AsyncActionHandler<SP, AsyncRequestedAction<AT['REQUEST'], RP>>,
    onSucceedAction?: AsyncActionHandler<SP, AsyncRequestedAction<AT['REQUEST'], SP>>,
    onFailedAction?: AsyncActionHandler<SP, AsyncRequestedAction<AT['REQUEST'], FP>>)
  : {
    types: AT,
    creators: AsyncActionCreators<AT, RP, SP, FP>
    reducer: AsyncActionReducer<AT, RP, SP, FP>
    initialState: AsyncStateItem<SP>
  }
export function createAsyncStateItem<
  AT extends AsyncActionTypes<string, string, string> | AsyncActionTypes<symbol, symbol, symbol>,
  RP extends unknown = unknown,
  SP extends unknown = unknown,
  FP extends AsyncFailureResponse = AsyncFailureResponse,
  >(
    nameOrTypes: string | AT,
    data?: SP | null,
    onRequestedAction?: AsyncActionHandler<SP, AsyncRequestedAction<AT['REQUEST'], RP>>,
    onSucceedAction?: AsyncActionHandler<SP, AsyncRequestedAction<AT['REQUEST'], SP>>,
    onFailedAction?: AsyncActionHandler<SP, AsyncRequestedAction<AT['REQUEST'], FP>>)
  : {
    types: AT,
    creators: AsyncActionCreators<AT, RP, SP, FP>
    reducer: AsyncActionReducer<AT, RP, SP, FP>
    initialState: AsyncStateItem<SP>
  } {

  const types: AT = (typeof nameOrTypes === 'string')
    ? createAsyncActionTypes(nameOrTypes) as AT
    : nameOrTypes
  const creators = createAsyncActionCreators<AT, RP, SP, FP>(types)
  const reducer = createAsyncActionReducer<AT, RP, SP, FP>(
    types, onRequestedAction, onSucceedAction, onFailedAction)
  const initialState = createInitAsyncStateItem<SP>(data)
  return { types, creators, reducer, initialState }
}
