export enum ERROR_CODE {
  /**
   * Cancelled
   */
  CANCELED = 0x0101,
  /**
   * Invalid password
   */
  BAD_PASSWORD = 0x0301,
  /**
   * Entered passwords differ
   */
  ENTERED_PASSWORD_DIFFER = 0x0302,
  /**
   * Incorrect password entered
   */
  WRONG_PASSWORD = 0x303,
  /**
   * Multiple plain files associated  with a cipher file path at the same time
   */
  DUPLICATED_CIPHER_FILEPATH = 0x0501,
}


export interface CustomError {
  code: ERROR_CODE
  message: string
}
