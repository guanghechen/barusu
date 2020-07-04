import { createAsyncActionCreators, createAsyncActionTypes } from '../../src'


const types = createAsyncActionTypes( '@user/me/request', '@user/me/success', '@user/me/failure')
const creators = createAsyncActionCreators<typeof types, { x: number }>(types)
const action1 = creators.request({ x: 2 })


/**
 * You will get a warning in the next line like:
 *
 *      This condition will always return 'false' since the types
 *      '"@user/me/request"' and '"@user/me/failure"' have no overlap.
 *
 * Because literal string are different type when their value are different
 */
console.log(action1.type === types.FAILURE)


/**
 * And also will be warned when you try to call the .request func with a
 * different type of payload than the typeof AsyncRequestedAction.payload
 */
creators.request({ x: '2' })
creators.request({ x: 2, y: 1 })
