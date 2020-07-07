[![npm version](https://img.shields.io/npm/v/@barusu/redux-actions.svg)](https://www.npmjs.com/package/@barusu/redux-actions)
[![npm download](https://img.shields.io/npm/dm/@barusu/redux-actions.svg)](https://www.npmjs.com/package/@barusu/redux-actions)
[![npm license](https://img.shields.io/npm/l/@barusu/redux-actions.svg)](https://www.npmjs.com/package/@barusu/redux-actions)


`@barusu/redux-actions` is a util package for creating async actions, async state item and reducer.


# Usage

## Install
  ```shell
  yarn add @barusu/redux-actions
  ```

## utils

  * `createActionCreator`
    - <details><summary>Function signature</summary>

      ```typescript
      /**
       * Create action creator
       * @param type              Action type
       * @param payloadRequired   Whether payload is required
       */
      export function createActionCreator<
        T extends symbol | string,
        P extends unknown
      >(type: T, payloadRequired: false)
        : (payload?: P) => Action<T, P>
      export function createActionCreator<
        T extends symbol | string,
        P extends unknown
      >(type: T, payloadRequired: true)
        : (payload: P) => Required<Action<T, P>>
      ```

    - <details><summary>Example</summary>

      ```typescript
      const UserCreator = createActionCreator<'@user/me', { name: string }>('@user/me', true)
      // => (payload: { name: string }) => ({ type: '@user/me', name })
      ```

  * `createAsyncActionCreator`
    - <details><summary>Function signature</summary>

      ```typescript
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
      export function createAsyncActionCreators<
        T extends string | symbol,
        RP extends unknown = unknown,
        SP extends unknown = unknown,
        FP extends AsyncFailureResponse = AsyncFailureResponse
      >(
        actionType: T
      ): AsyncActionCreators<T, RP, SP, FP>
      ```

    - <details><summary>Example</summary>

      ```typescript
      // action for fetching user
      const UserFetchActionType = '@user/fetch'
      type UserFetchActionType = typeof UserFetchActionType
      type UserFetchRequestVo = { name: string }
      type UserFetchSucceedVo = { name: string, gender: 'male' | 'female' }
      type UserFetchFailedVo = AsyncFailureResponse

      // action for updating user
      const UserUpdateActionType = '@user/update'
      type UserUpdateActionType = typeof UserUpdateActionType
      type UserUpdateRequestVo = { name: string, gender?: 'male' | 'female' }
      type UserUpdateSucceedVo = { name: string, gender: 'male' | 'female' }
      type UserUpdateFailedVo = AsyncFailureResponse

      type UserActionTypes = UserFetchActionType | UserUpdateActionType
      const UserActionCreators = {
        fetch: createAsyncActionCreator<UserFetchActionType, UserFetchRequestVo,
                UserFetchSucceedVo, UserFetchFailedVo>(UserFetchActionType),
      }
      // => {
      //  fetch: {
      //    request: (payload?: UserFetchRequestVo) => ({ type: '@user/fetch_user', status: 'REQUESTED', payload }),
      //    success: (payloadF: UserFetchSucceedVo) => ({ type: '@user/fetch_user', status: 'SUCCEED', payload }),
      //    failure: (payload?: UserFetchFailedVo) => ({ type: '@user/fetch_user', status: 'FAILED', payload }),
      //  }
      // }
      ```

  * `createAsyncActionReducer`
    - <details><summary>Function signature</summary>

      ```typescript
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
      ): AsyncActionReducer<S, T, AsyncActions<T, RP, SP, FP>>
      ```

    - <details><summary>Example</summary>

      ```typescript
      export type UserStateData { name: string gender: string }
      export type UserState = AsyncStateItem<UserStateData>

      // action for fetching user
      const UserFetchActionType = '@user/fetch'
      type UserFetchActionType = typeof UserFetchActionType
      type UserFetchRequestVo = { name: string }
      type UserFetchSucceedVo = { name: string, gender: 'male' | 'female' }
      type UserFetchFailedVo = AsyncFailureResponse

      // action for updating user
      const UserUpdateActionType = '@user/update'
      type UserUpdateActionType = typeof UserUpdateActionType
      type UserUpdateRequestVo = { name: string, gender?: 'male' | 'female' }
      type UserUpdateSucceedVo = { name: string, gender: 'male' | 'female' }
      type UserUpdateFailedVo = AsyncFailureResponse

      type UserActionTypes = UserFetchActionType | UserUpdateActionType
      const UserActionCreators = {
        fetch: createAsyncActionReducer<UserState, UserFetchActionType,
                UserFetchRequestVo, UserFetchSucceedVo, UserFetchFailedVo>(UserFetchActionType),
      }
      export const userReducer = assembleActionReducers<UserState, UserActionTypes>([
        fetchUserActionReducer,
      ])
      ```

  * `createInitAsyncStateItem`
    - <details><summary>Function signature</summary>

      ```typescript
      /**
       * Create initial state item
       * @param data
       */
      export function createInitAsyncStateItem<D>(data?: D | null): AsyncStateItem<D> {
        return {
          loading: false,
          data: data === undefined ? null : data,
          error: null
        }
      }
      ```

    - <details><summary>Example</summary>

      ```typescript
      export type UserStateData { name: string gender: string }
      export type UserState = AsyncStateItem<UserStateData>
      export const initialUserState = createInitAsyncStateItem<UserStateData>({
        name: 'alice',
        gender: 'female',
      })
      ```

  * `assembleActionReducers`
    - <details><summary>Function signature</summary>

      ```typescript
      export function assembleActionReducers<
        S extends AsyncStateItem<unknown>,
        T extends string | symbol,
        R extends AsyncActionReducer<S, T, AsyncActions<T, unknown>>
      >(
        actionReducers: R[],
      ): Reducer<S, AsyncActions<T, unknown>>
      ```

  * `createAsyncAction`
    - <details><summary>Function signature</summary>

      ```typescript
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
      }
      ```

    - <details><summary>Example</summary>

      ```typescript
      export type UserStateData { name: string gender: string }
      export type UserState = AsyncStateItem<UserStateData>

      // action for fetching user
      const UserFetchActionType = '@user/fetch'
      type UserFetchActionType = typeof UserFetchActionType
      type UserFetchRequestVo = { name: string }
      type UserFetchSucceedVo = { name: string, gender: 'male' | 'female' }
      type UserFetchFailedVo = AsyncFailureResponse

      // action for updating user
      const UserUpdateActionType = '@user/update'
      type UserUpdateActionType = typeof UserUpdateActionType
      type UserUpdateRequestVo = { name: string, gender?: 'male' | 'female' }
      type UserUpdateSucceedVo = { name: string, gender: 'male' | 'female' }
      type UserUpdateFailedVo = AsyncFailureResponse

      type UserActionTypes = UserFetchActionType | UserUpdateActionType
      export const {
        creator: fetchUserActionCreator,
        reducer: fetchUserActionReducer,
      } = createAsyncAction<
        UserState, UserFetchActionType, UserFetchRequestVo, UserFetchSucceedVo, UserFetchFailedVo> (UserActionTypes.FETCH_USER)

      const UserCreator = {
        fetch: createAsyncActionReducer<UserState, UserFetchActionType,
                UserFetchRequestVo, UserFetchSucceedVo, UserFetchFailedVo>(UserFetchActionType),
      }
      export const userReducer = assembleActionReducers<UserState, UserActionTypes>([
        fetchUserActionReducer,
      ])
      ```
