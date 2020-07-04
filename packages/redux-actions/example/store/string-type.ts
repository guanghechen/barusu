import { AsyncStateItem, createAsyncStateItem } from '../../src'


type UserState = { name: string, age: number }


export interface StoreState {
  /**
   *
   */
  user: AsyncStateItem<UserState>
}


const {
  types: userTypes,
  creators: userActions,
  reducer: userReducer,
  initialState: initialUserState,
} = createAsyncStateItem<{ name: string }, UserState>('@user')


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
