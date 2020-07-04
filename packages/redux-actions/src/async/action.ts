import { Action } from '../plain'
import { AsyncActionTypes } from './constant'


/**
 * Response of failed request
 */
export interface AsyncFailureResponse {
  /**
   * Error code
   */
  code: number
  /**
   * Error message
   */
  message: string
  /**
   * Debugging information
   */
  debug?: string
}


/**
 * Requested action
 */
export type AsyncRequestedAction<
  T extends string | symbol,
  P extends unknown>
  = Action<T, P>


/**
 * Request succeed action
 */
export type AsyncSucceedAction<
  T extends string | symbol,
  P extends unknown>
  = Required<Action<T, P>>


/**
 * Request failed action
 */
export type AsyncFailedAction<
  T extends string | symbol,
  P extends AsyncFailureResponse>
  = Required<Action<T, P>>


/**
 * Async actions
 */
export type AsyncActions<
  AT extends AsyncActionTypes<string, string, string> | AsyncActionTypes<symbol, symbol, symbol>,
  RP extends unknown = unknown,
  SP extends unknown = unknown,
  FP extends AsyncFailureResponse = AsyncFailureResponse>
  =
  | AsyncRequestedAction<AT['REQUEST'], RP>   // Requested action
  | AsyncSucceedAction<AT['SUCCESS'], SP>     // Succeed action
  | AsyncFailedAction<AT['FAILURE'], FP>      // Failed action
