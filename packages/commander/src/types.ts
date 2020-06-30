export enum ErrorCode {
  /**
   * Bad option
   */
  BAD_OPTION = 'BAD_OPTION'
}


export interface CustomError {
  /**
   * Error code
   */
  code: ErrorCode,
  /**
   * Error message
   */
  message?: string
}


/**
 * Process option value
 * @param newVal  new option value
 * @param oldVal  old option value
 */
export type OptionValueProcessor<T> = (newVal: string, oldVal?: T) => T | undefined
