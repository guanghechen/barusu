<header>
  <h1 align="center">
    <a href="https://github.com/guanghechen/barusu/tree/main/packages/event-bus#readme">@barusu/event-bus</a>
  </h1>
  <div align="center">
    <a href="https://www.npmjs.com/package/@barusu/event-bus">
      <img
        alt="Npm Version"
        src="https://img.shields.io/npm/v/@barusu/event-bus.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@barusu/event-bus">
      <img
        alt="Npm Download"
        src="https://img.shields.io/npm/dm/@barusu/event-bus.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@barusu/event-bus">
      <img
        alt="Npm License"
        src="https://img.shields.io/npm/l/@barusu/event-bus.svg"
      />
    </a>
    <a href="https://github.com/nodejs/node">
      <img
        alt="Node.js Version"
        src="https://img.shields.io/node/v/@barusu/event-bus"
      />
    </a>
    <a href="https://github.com/facebook/jest">
      <img
        alt="Tested with Jest"
        src="https://img.shields.io/badge/tested_with-jest-9c465e.svg"
      />
    </a>
    <a href="https://github.com/prettier/prettier">
      <img
        alt="Code Style: prettier"
        src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square"
      />
    </a>
  </div>
</header>
<br/>


## Install

  ```bash
  npm install --save @barusu/event-bus
  ```

* yarn

  ```bash
  yarn add @barusu/event-bus
  ```

## Usage

### Examples

  * Basic

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

