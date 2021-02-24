import type {
  Event,
  EventHandler,
  EventListener,
  EventPayload,
  EventSubscriber,
  EventType,
} from '../types'

/**
 * Type of SimpleEvent
 */
export type SimpleEventType = EventType

/**
 * Payload of SimpleEvent
 */
export type SimpleEventPayload = EventPayload

/**
 * Simple event
 */
export interface SimpleEvent<
  T extends SimpleEventType = SimpleEventType,
  P extends SimpleEventPayload = SimpleEventPayload
> extends Event<T, P> {}

/**
 * SimpleEvent handler
 */
export interface SimpleEventHandler<
  T extends SimpleEventType = SimpleEventType,
  P extends SimpleEventPayload = SimpleEventPayload,
  E extends SimpleEvent<T, P> = SimpleEvent<T, P>
> extends EventHandler<T, P, E> {}

/**
 * SimpleEvent subscriber
 */
export interface SimpleEventSubscriber<
  T extends SimpleEventType = SimpleEventType,
  P extends SimpleEventPayload = SimpleEventPayload,
  E extends SimpleEvent<T, P> = SimpleEvent<T, P>
> extends EventSubscriber<T, P, E> {}

/**
 * SimpleEvent listener
 */
export interface SimpleEventListener<
  T extends SimpleEventType = SimpleEventType,
  P extends SimpleEventPayload = SimpleEventPayload,
  E extends SimpleEvent<T, P> = SimpleEvent<T, P>
> extends EventListener<T, P, E> {}
