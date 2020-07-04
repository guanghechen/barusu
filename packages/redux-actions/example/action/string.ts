import { createAsyncActionCreators, createAsyncActionTypes } from '../../src'


const types = createAsyncActionTypes('@user/me')

const creators = createAsyncActionCreators<typeof types, { x: number }>(types)
const action1 = creators.request({ x: 2 })


/**
 * You will never get a warning in the next line like, because all of
 * them are of type string
 */
console.log(action1.type === types.FAILURE)


/**
 * But you will still be warned when you try to call the .request func with a
 * different type of payload than the typeof AsyncRequestedAction.payload
 */
creators.request({ x: '2' })
creators.request({ x: 2, y: 1})
