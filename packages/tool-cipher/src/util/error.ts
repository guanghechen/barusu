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
}


export interface CustomError {
  code: ERROR_CODE
  message: string
}
