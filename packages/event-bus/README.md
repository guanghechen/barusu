[![npm version](https://img.shields.io/npm/v/@barusu/event-bus.svg)](https://www.npmjs.com/package/@barusu/event-bus)
[![npm download](https://img.shields.io/npm/dm/@barusu/event-bus.svg)](https://www.npmjs.com/package/@barusu/event-bus)
[![npm license](https://img.shields.io/npm/l/@barusu/event-bus.svg)](https://www.npmjs.com/package/@barusu/event-bus)

# Usage

## Install
  ```shell
  yarn add @barusu/event-bus
  ```

## Demo

  ```typescript
  import { SimpleEvent, SimpleEventBus, SimpleEventHandler } from '@barusu/event-bus'


  enum EventTypes {
    INIT = 'INIT',
    EXIT = 'EXIT',
  }

  const eventBus = new SimpleEventBus<EventTypes>()

  const handle: EventHandler<EventTypes> = (evt: SimpleEvent<EventTypes>) => {
    console.log('evt:', evt)
  }

  // Listen for specific event
  eventBus.on(EventTypes.INIT, handle)

  // Listen for specific event, and only need to be called once
  eventBus.once(EventTypes.INIT, handle)

  // Listen for all events
  eventBus.subscribe(handle, true)

  // Remove listener
  eventBus.removeEventListener(EventTypes.INIT, handle)

  // Remove subscriber
  eventBus.unsubscribe(handle)
  ```

