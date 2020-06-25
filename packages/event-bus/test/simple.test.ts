import { expect } from 'chai'
import { describe, it } from 'mocha'
import {
  SimpleEvent,
  SimpleEventBus,
  SimpleEventHandler,
} from '../src'


export enum EventTypes {
  INIT = 'INIT',
  EXIT = 'EXIT',
}


describe('simple-event-bus', function () {
  describe('listener', function () {
    it('Only event emitted after the event-listener register could be received', function () {
      const eventBus = new SimpleEventBus<EventTypes>()
      const [ messages, handle ] = createEventHandler()

      eventBus.dispatch({ type: EventTypes.INIT, payload: { id: 1 } })
      eventBus.on(EventTypes.INIT, handle)
      eventBus.dispatch({ type: EventTypes.INIT, payload: { id: 2 } })
      eventBus.dispatch({ type: EventTypes.INIT, payload: { id: 3 } })

      expect(messages).to.have.lengthOf(2)
      expect(messages).to.eql([
        { type: EventTypes.INIT, payload: { id: 2 } },
        { type: EventTypes.INIT, payload: { id: 3 } },
      ])
    })

    it('Only be executed once if the event-listener registered through the `.once()`', function () {
      const eventBus = new SimpleEventBus<EventTypes>()
      const [ messages, handle ] = createEventHandler()

      eventBus.once(EventTypes.INIT, handle)
      eventBus.dispatch({ type: EventTypes.INIT, payload: { id: 1 } })
      eventBus.dispatch({ type: EventTypes.INIT, payload: { id: 2 } })

      expect(messages).to.have.lengthOf(1)
      expect(messages).to.eql([
        { type: EventTypes.INIT, payload: { id: 1 } }
      ])
    })

    it('Only listened events will trigger event-listener', function () {
      const eventBus = new SimpleEventBus<EventTypes>()
      const [ messages, handle ] = createEventHandler()

      eventBus.dispatch({ type: EventTypes.INIT, payload: { id: 1 } })
      eventBus.on(EventTypes.INIT, handle)
      eventBus.dispatch({ type: EventTypes.INIT, payload: { id: 2 } })
      eventBus.dispatch({ type: EventTypes.EXIT, payload: { id: 3 } })
      eventBus.dispatch({ type: EventTypes.INIT, payload: { id: 4 } })
      eventBus.dispatch({ type: EventTypes.INIT, payload: { id: 5 } })

      expect(messages).to.have.lengthOf(3)
      expect(messages).to.eql([
        { type: EventTypes.INIT, payload: { id: 2 } },
        { type: EventTypes.INIT, payload: { id: 4 } },
        { type: EventTypes.INIT, payload: { id: 5 } },
      ])
    })

    it('Event listener could be unregistered manually', function () {
      const eventBus = new SimpleEventBus<EventTypes>()
      const [ messages, handle ] = createEventHandler()

      eventBus.dispatch({ type: EventTypes.INIT, payload: { id: 1 } })
      eventBus.on(EventTypes.INIT, handle)
      eventBus.dispatch({ type: EventTypes.INIT, payload: { id: 2 } })
      eventBus.dispatch({ type: EventTypes.EXIT, payload: { id: 3 } })
      eventBus.dispatch({ type: EventTypes.INIT, payload: { id: 4 } })
      eventBus.removeEventListener(EventTypes.INIT, handle)
      eventBus.dispatch({ type: EventTypes.INIT, payload: { id: 5 } })

      expect(messages).to.have.lengthOf(2)
      expect(messages).to.eql([
        { type: EventTypes.INIT, payload: { id: 2 } },
        { type: EventTypes.INIT, payload: { id: 4 } },
      ])
    })
  })
})


function createEventHandler(): [
  SimpleEvent<EventTypes>[],
  SimpleEventHandler<EventTypes>['handle']
] {
  const messages: SimpleEvent<EventTypes>[] = []
  const handle = (evt: SimpleEvent<EventTypes>) => messages.push(evt)
  return [messages, handle]
}
