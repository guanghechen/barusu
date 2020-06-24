/**
 * Type of Event
 */
export type EventType = number | string | symbol


/**
 * Payload of Event
 */
export type EventPayload = number | string | symbol | Record<string, any>


/**
 * Event
 */
export interface Event<
  T extends EventType = EventType,
  P extends EventPayload = EventPayload,
  > {
  /**
   * Type of Event
   */
  type: T
  /**
   * Payload of event
   */
  payload?: P
}


/**
 * Event handler
 */
export interface EventHandler<
  T extends EventType = EventType,
  P extends EventPayload = EventPayload,
  E extends Event<T, P> = Event<T, P>,
  > {
  /**
   * The return value will be ignored
   *
   * @param evt
   */
  handle(evt: Readonly<E>): void | Promise<void> | any | Promise<any>
}


/**
 * Event subscriber
 */
export interface EventSubscriber<
  T extends EventType = EventType,
  P extends EventPayload = EventPayload,
  E extends Event<T, P> = Event<T, P>,
  > extends EventHandler<T, P, E> {
  /**
   * An one-off subscriber which would be unregistered from EventBus after first called
   */
  once: boolean
}


/**
 * Event listener
 */
export interface EventListener<
  T extends EventType = EventType,
  P extends EventPayload = EventPayload,
  E extends Event<T, P> = Event<T, P>,
  > extends EventHandler<T, P, E> {
  /**
   * An one-off subscriber which would be unregistered from EventBus after first called
   */
  once: boolean
}
