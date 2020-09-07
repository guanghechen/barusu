/**
 *
 */
export interface Mocker<D> {
  /**
   * Start mock logger
   */
  mock: () => void
  /**
   * Restore mock
   */
  restore: () => void
  /**
   * Discard the previously collected data
   */
  reset: (data?: D) => void
  /**
   * Get collected data
   */
  data: () => D
}
