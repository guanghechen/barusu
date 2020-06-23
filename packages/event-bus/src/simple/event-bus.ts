import {
  SimpleEvent,
  SimpleEventListener,
  SimpleEventSubscriber,
} from './types'


/**
 *
 */
export class SimpleEventBus<T extends string | number | symbol> {
  protected readonly listeners: Record<T, SimpleEventListener<T>[]>
  protected readonly subscribers: SimpleEventSubscriber<T>[]

  public constructor() {
    this.listeners = {} as Record<T, SimpleEventListener<T>[]>
    this.subscribers = []
  }

  /**
   * Add event listener
   * @param type
   * @param handle
   * @see this#addEventListener
   */
  public on(
    type: T,
    handle: SimpleEventListener<T>['handle']
  ): this {
    return this.addEventListener(type, handle, false)
  }

  /**
   * Add event listener
   * @param type
   * @param handle
   * @see this#addEventListener
   */
  public once(
    type: T,
    handle: SimpleEventListener<T>['handle']
  ): this {
    return this.addEventListener(type, handle, true)
  }

  /**
   * Add event listener
   * @param type
   * @param handle
   */
  public addEventListener(
    type: T,
    handle: SimpleEventListener<T>['handle'],
    once: boolean,
  ): this {
    const listeners = this.listeners[type] || []
    const realListener: SimpleEventListener<T> = {
      once,
      handle: handle,
    }
    listeners.push(realListener)
    this.listeners[type] = listeners
    return this
  }

  /**
   * Remove event listener
   * @param type
   * @param handle
   */
  public removeEventListener(
    type: T,
    handle: SimpleEventListener<T>['handle'],
  ): this {
    const listeners = this.listeners[type]
    if (listeners != null) {
      const index = listeners.findIndex(x => x.handle !== handle)
      if (index >= 0) {
        listeners.splice(index, 1)
      }
    }
    return this
  }

  /**
   * Subscribe to the event
   * @param handle
   */
  public subscribe(
    handle: SimpleEventSubscriber<T>['handle'],
    once: boolean,
  ): this {
    const realSubscriber: SimpleEventSubscriber<T> = {
      once,
      handle: handle
    }
    this.subscribers.push(realSubscriber)
    return this
  }

  /**
   * Cancel Subscription
   * @param handle
   */
  public unsubscribe(handle: SimpleEventSubscriber<T>['handle']): this {
    const index = this.subscribers.findIndex(x => x.handle !== handle)
    if (index >= 0) {
      this.subscribers.splice(index, 1)
    }
    return this
  }

  /**
   * dispatch event & emit notification to subscribers and listeners
   * @param evt
   */
  public dispatch(evt: Readonly<SimpleEvent<T>>): this {
    // trigger subscribers
    const subscribers = this.subscribers
    for (const subscriber of subscribers) {
      subscriber.handle(evt)

      if (subscriber.once) {
        this.unsubscribe(subscriber.handle)
      }
    }

    // trigger listeners
    const listeners = this.listeners[evt.type]
    if (listeners != null) {
      for (const listener of listeners) {
        listener.handle(evt)

        if (listener.once) {
          this.removeEventListener(evt.type, listener.handle)
        }
      }
    }
    return this
  }
}
