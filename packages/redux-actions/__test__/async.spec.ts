import {
  assembleActionReducers,
  AsyncActionCreator,
  AsyncActionReducer,
  AsyncActions,
  AsyncActionStatus,
  AsyncFailureResponse,
  AsyncStateItem,
  createAsyncAction,
  createAsyncActionCreator,
  createAsyncActionReducer,
  createAsyncStateItem,
} from '../src'


describe('state', function () {
  test('createAsyncStateItem', function () {
    const emptyState: AsyncStateItem<{ username: string }> = createAsyncStateItem()
    const state: AsyncStateItem<{ username: string }> = createAsyncStateItem({ username: 'waw' })

    expect(emptyState).toEqual({
      loading: false,
      data: null,
      error: null,
    })

    expect(state).toEqual({
      loading: false,
      data: { username: 'waw' },
      error: null,
    })
  })
})


describe('creator', function () {
  test('createAsyncActionCreator', function () {
    type RP = { username: string }
    type SP = { username: string, age: number }
    type FP = AsyncFailureResponse

    const creatorsList: AsyncActionCreator<'fetch-user', RP, SP, FP>[] = [
      createAsyncActionCreator('fetch-user'),
      createAsyncAction<any, 'fetch-user', RP, SP, FP>('fetch-user').creator,
    ]

    for (const fetchUserActionCreators of creatorsList) {
      expect(fetchUserActionCreators.request({ username: 'alice' })).toEqual({
        type: 'fetch-user',
        status: AsyncActionStatus.REQUESTED,
        payload: { username: 'alice' },
      })

      expect(fetchUserActionCreators.success({ username: 'alice', age: 32 })).toEqual({
        type: 'fetch-user',
        status: AsyncActionStatus.SUCCEED,
        payload: { username: 'alice', age: 32 },
      })

      expect(
        fetchUserActionCreators.failure({
          code: 500,
          message: 'Internal Server Error',
          debug: '`alice` cannot be accessible',
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          // Extra argument will cause the Type Checking Error by ts
          extra: 'no',
        })
      ).toEqual({
        type: 'fetch-user',
        status: AsyncActionStatus.FAILED,
        payload: {
          code: 500,
          message: 'Internal Server Error',
          debug: '`alice` cannot be accessible',
          extra: 'no',
        }
      })
    }
  })
})


describe('reducer', function () {
  test('createAsyncActionReducer', function () {
    const actionType: unique symbol = Symbol('waw')
    const state = createAsyncStateItem<string>('hello')

    type S = typeof state
    type T = typeof actionType
    type RP = string
    type SP = string
    type FP = AsyncFailureResponse

    const creators = createAsyncActionCreator<T, RP, SP, FP>(actionType)
    const reducers: AsyncActionReducer<S, T, AsyncActions<T, RP, SP, FP>>[] = [
      createAsyncActionReducer<S, T>(actionType),
      createAsyncAction<S, T, RP, SP, FP>(actionType).reducer,
    ]

    for (const reducer of reducers) {
      expect(
        reducer.process(state, creators.request('world!'))
      ).toEqual({
        loading: true,
        data: 'hello',
        error: null,
      })

      expect(
        reducer.process(state, creators.success('world!'))
      ).toEqual({
        loading: false,
        data: 'world!',
        error: null,
      })

      expect(
        reducer.process(state, creators.failure({
          code: 500,
          message: 'Internal Server Error',
          debug: '`alice` cannot be accessible',
        }))
      ).toEqual({
        loading: false,
        data: 'hello',
        error: {
          code: 500,
          message: 'Internal Server Error',
          debug: '`alice` cannot be accessible',
        },
      })

      expect(
        reducer.process(state, { type: 'waw' } as any)
      ).toEqual(state)

      expect(
        reducer.process(state, { type: actionType, status: 'waw' } as any)
      ).toEqual(state)
    }
  })

  test('assembleActionReducers', function () {
    const actionType: unique symbol = Symbol('waw')
    const creators = createAsyncActionCreator(actionType)
    const initialState = createAsyncStateItem<string>('hello')
    const actionReducer = createAsyncActionReducer<
      typeof initialState, typeof actionType>(actionType)
    const reducer = assembleActionReducers(initialState, [actionReducer])

    for (const state of [undefined, initialState]) {
      expect(
        reducer(state, creators.request('world!'))
      ).toEqual({
        loading: true,
        data: 'hello',
        error: null,
      })

      expect(
        reducer(state, creators.success('world!'))
      ).toEqual({
        loading: false,
        data: 'world!',
        error: null,
      })

      expect(
        reducer(state, creators.failure({
          code: 500,
          message: 'Internal Server Error',
          debug: '`alice` cannot be accessible',
        }))
      ).toEqual({
        loading: false,
        data: 'hello',
        error: {
          code: 500,
          message: 'Internal Server Error',
          debug: '`alice` cannot be accessible',
        },
      })

      expect(
        reducer(state, { type: 'waw' } as any)
      ).toEqual(initialState)

      expect(
        reducer(state, { type: actionType, status: 'waw' } as any)
      ).toEqual(initialState)
    }
  })
})
