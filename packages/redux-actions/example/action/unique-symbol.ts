import { createAsyncActionCreators, createAsyncActionTypes } from '../../src'


const requestedType: unique symbol = Symbol('@user/me/request')
const succeedType: unique symbol = Symbol('@user/me/success')
const failedType: unique symbol = Symbol('@user/me/failure')
const types = createAsyncActionTypes(requestedType, succeedType, failedType)

const creators = createAsyncActionCreators<typeof types, { x: number }>(types)
const action1 = creators.request({ x: 2 })


/**
 * You will get a warning in the next line like:
 *
 *      This condition will always return 'false' since the types
 *      'typeof requestedType' and 'typeof failedType' have no overlap.
 *
 * Because unique symbol are different type each other in TypeScript
 */
console.log(action1.type === types.FAILURE)


/**
 * And also will be warned when you try to call the .request func with a
 * different type of payload than the typeof AsyncRequestedAction.payload
 */
creators.request({ x: '2' })
creators.request({ x: 2, y: 1})
