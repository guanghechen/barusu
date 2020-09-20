import { AsyncFailureResponse } from './action'


/**
 * State item with data fetch/updated through async funcs
 */
export interface AsyncStateItem<D> {
  /**
   * Whether is loading
   */
  loading: boolean
  /**
   * Data
   */
  data: D | null
  /**
   * Error message object
   */
  error: AsyncFailureResponse | null
}


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
