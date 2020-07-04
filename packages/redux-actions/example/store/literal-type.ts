import {
  AsyncStateItem,
  createAsyncActionTypes,
  createAsyncStateItem
} from '../../src'


type UserState = { name: string, age: number }


export interface StoreState {
  /**
   *
   */
  user: AsyncStateItem<UserState>
}


export const userTypes = createAsyncActionTypes('@user/request', '@user/success', '@user/failure')

// or use unique symbol
const requestedType: unique symbol = Symbol('@user/request')
const succeedType: unique symbol = Symbol('@user/success')
const failedType: unique symbol = Symbol('@user/failure')
export const userTypes2 = createAsyncActionTypes(requestedType, succeedType, failedType)


const {
  creators: userActions,
  reducer: userReducer,
  initialState: initialUserState,
} = createAsyncStateItem<typeof userTypes, { name: string }, UserState>(userTypes)

userActions.request({ name: 'alice' })


/**
 *
 */
export const initialStoreState: StoreState = {
  user: initialUserState,
}


// export const reducer = combineReducers<StoreState>({
//   user: userReducer,
// })
