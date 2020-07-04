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
    <details>

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

  * `createAsyncActionTypes`
    <details>

    ```typescript
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
    ```

  * `createAsyncActionCreators`
    <details>

    ```typescript
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
      : AsyncActionCreators<AT, RP, SP, FP>
    ```

  * `createAsyncActionReducer`
    <details>

    ```typescript
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
      : AsyncActionReducer<AT, RP, SP, FP>
    ```

  * `createInitAsyncStateItem`
    <details>

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

  * `createAsyncStateItem`
    <details>

    ```typescript
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
    ```

# Examples

## Create action
  ```typescript
  const userMeCreator = createActionCreator('@user/me')
  ```

## Create Async actions
  ```typescript
  type UserMeRequestVo = { name: string }
  type UserMeState = { name: string, age: number }
  ```

  * Use literal strings as action types, the returned `REQUEST`, `SUCCESS`, `FAILURE` of ActionTypes will be recognized as different types by TypeScript. (Recommended)
    ```typescript
    const userTypes = createAsyncActionTypes(
      '@me/request', '@me/success', '@me/failure')
    const {
      creators: userActions,
      reducer: userReducer,
      initialState: initialUserState,
    } = createAsyncStateItem<typeof userTypes, UserMeRequestVo, UserState>(userTypes)
    ```

  * Use unique symbols as action types, the returned `REQUEST`, `SUCCESS`, `FAILURE` of ActionTypes will be recognized as different types by TypeScript.
    ```typescript
    const requestedType: unique symbol = Symbol('@me/request')
    const succeedType: unique symbol = Symbol('@me/success')
    const failedType: unique symbol = Symbol('@me/failure')
    const userTypes = createAsyncActionTypes(requestedType, succeedType, failedType)
    const {
      creators: userActions,
      reducer: userReducer,
      initialState: initialUserState,
    } = createAsyncStateItem<typeof userTypes, UserMeRequestVo, UserState>(userTypes)
    ```

  * Use strings as action types, the returned `REQUEST`, `SUCCESS`, `FAILURE` of ActionTypes will be recognized as same types by TypeScript. (Not recommended)
    ```typescript
    const {
      types: userTypes,
      creators: userActions,
      reducer: userReducer,
      initialState: initialUserState,
    } = createAsyncStateItem<UserMeRequestVo, UserState>('@me')
    // => types = {
    //  REQUEST: '@me/REQUEST',
    //  SUCCESS: '@me/SUCCESS',
    //  FAILURE: '@me/FAILURE', }
    ```
