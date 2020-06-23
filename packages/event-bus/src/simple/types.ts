/**
 * Event
 */
export interface SimpleEvent<
  T extends string | number | symbol,
  P extends Record<string, any> = Record<string, any>,
  > {
  /**
   * Type of Event
   */
  type: T
  /**
   * Payload of event
   */
  payload: P
}


/**
 * Event subscriber
 */
export interface SimpleEventSubscriber<
  T extends string | number | symbol,
  P extends Record<string, any> = Record<string, any>,
  > {
  /**
   * Unregister from EventBus after first call
   */
  once: boolean
  /**
   * Called no matter what event emitted
   */
  handle(evt: Readonly<SimpleEvent<T, P>>): void | Promise<void>
}


/**
 * Event listener
 */
export interface SimpleEventListener<
  T extends string | number | symbol,
  P extends Record<string, any> = Record<string, any>,
  > {
  /**
   * Unregister from EventBus after first call
   */
  once: boolean
  /**
   * Called when an event with same type of `evt` emitted
   */
  handle(evt: Readonly<SimpleEvent<T, P>>): void | Promise<void>
}
