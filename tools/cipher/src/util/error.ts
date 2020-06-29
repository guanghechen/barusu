/**
 *
 */
export enum ErrorCode {
  /**
   * Invalid password
   */
  BAD_PASSWORD = 'BAD_PASSWORD',
  /**
   * Entered passwords differ
   */
  ENTERED_PASSWORD_DIFFER = 'ENTERED_PASSWORD_DIFFER',
  /**
   * Incorrect password entered
   */
  WRONG_PASSWORD = 'WRONG_PASSWORD',
  /**
   * Multiple plain files associated  with a cipher file path at the same time
   */
  DUPLICATED_CIPHER_FILEPATH = 'DUPLICATED_CIPHER_FILEPATH',
  /**
   * Null pointer exception
   */
  NULL_POINTER_ERROR = 'NULL_POINTER_ERROR'
}


/**
 *
 */
export interface CustomError {
  /**
   *
   */
  code: ErrorCode
  /**
   *
   */
  message: string
}
