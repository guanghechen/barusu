import {
  SimpleEvent,
  SimpleEventHandler,
  SimpleEventListener,
  SimpleEventSubscriber,
  SimpleEventType,
} from './types'
export * from './types'


/**
 * 仅提供简单的 发布/订阅 机制，事件总线不在意订阅者是否正确处理事件，
 * 它只关心有没有将事件传递给它的订阅者；需要注意的是：
 *  - 所有的订阅者处理都是并行的，尽管它们按照订阅的顺序接收到事件，
 *    但并不提供前一个订阅者总是在下一个订阅者接收到事件前完成处理的保证；
 *  - 当某个订阅者的处理函数抛出一个 Error 时，将中断总线的消息传递；
 */
export class SimpleEventBus<T extends SimpleEventType> {
  protected readonly listeners: Record<T, SimpleEventListener<T>[]>
  protected readonly subscribers: SimpleEventSubscriber<T>[]

  public constructor() {
    this.listeners = {} as Record<T, SimpleEventListener<T>[]>
    this.subscribers = []
  }

  /**
   * Add SimpleEvent listener
   * @param type
   * @param handle
   * @see this#addEventListener
   */
  public on(
    type: T,
    handle: SimpleEventHandler<T>['handle'],
  ): this {
    return this.addEventListener(type, handle, false)
  }

  /**
   * Add SimpleEvent listener
   * @param type
   * @param handle
   * @see this#addEventListener
   */
  public once(
    type: T,
    handle: SimpleEventHandler<T>['handle'],
  ): this {
    return this.addEventListener(type, handle, true)
  }

  /**
   * Add SimpleEvent listener
   * @param type
   * @param handle
   */
  public addEventListener(
    type: T,
    handle: SimpleEventHandler<T>['handle'],
    once: boolean,
  ): this {
    const listeners = this.listeners[type] || []

    // An event listener can only be registered once for each particular event
    if (listeners.find(x => x.handle === handle)) {
      return this
    }

    const realListener: SimpleEventListener<T> = { once, handle }
    listeners.push(realListener)
    this.listeners[type] = listeners
    return this
  }

  /**
   * Remove SimpleEvent listener
   * @param type
   * @param handle
   */
  public removeEventListener(
    type: T,
    handle: SimpleEventHandler<T>['handle'],
  ): this {
    const listeners = this.listeners[type]
    if (listeners != null) {
      const index = listeners.findIndex(x => x.handle === handle)
      if (index >= 0) {
        listeners.splice(index, 1)
      }
    }
    return this
  }

  /**
   * Subscribe to the SimpleEvent
   * @param handle
   */
  public subscribe(
    handle: SimpleEventHandler<T>['handle'],
    once: boolean,
  ): this {
    const subscribers = this.subscribers

    // A subscriber can only be registered once
    if (subscribers.find(x => x.handle === handle)) {
      return this
    }

    const realSubscriber: SimpleEventSubscriber<T> = { once, handle }
    subscribers.push(realSubscriber)
    return this
  }

  /**
   * Cancel Subscription
   * @param handle
   */
  public unsubscribe(handle: SimpleEventHandler<T>['handle']): this {
    const index = this.subscribers.findIndex(x => x.handle === handle)
    if (index >= 0) {
      this.subscribers.splice(index, 1)
    }
    return this
  }

  /**
   * dispatch SimpleEvent & emit notification to subscribers and listeners
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

  public clear(): this {
    const self = this as this & any
    self.listeners = []
    self.subscribers = {}
    return this
  }
}
