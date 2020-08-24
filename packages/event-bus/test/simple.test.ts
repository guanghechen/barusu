import { expect } from 'chai'
import { SimpleEvent, SimpleEventBus, SimpleEventHandler } from '../src'


export enum EventTypes {
  INIT = 'INIT',
  EXIT = 'EXIT',
}


describe('simple-bus', function () {
  describe('listener', function () {
    it('Only event emitted after the listener register could be received', function () {
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

    it('Only be executed once if the listener registered through the `.once()`', function () {
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

    it('Only listened events will trigger listener', function () {
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

    it('Event listener can only be registered once for each particular event', function () {
      const eventBus = new SimpleEventBus<EventTypes>()
      const [ messages, handle ] = createEventHandler()

      eventBus.dispatch({ type: EventTypes.INIT, payload: { id: 1 } })
      eventBus.on(EventTypes.INIT, handle)
      eventBus.dispatch({ type: EventTypes.INIT, payload: { id: 2 } })
      eventBus.on(EventTypes.INIT, handle)
      eventBus.dispatch({ type: EventTypes.EXIT, payload: { id: 3 } })
      eventBus.on(EventTypes.EXIT, handle)
      eventBus.dispatch({ type: EventTypes.EXIT, payload: { id: 4 } })
      eventBus.on(EventTypes.INIT, handle)
      eventBus.removeEventListener(EventTypes.INIT, handle)
      eventBus.dispatch({ type: EventTypes.INIT, payload: { id: 5 } })
      eventBus.dispatch({ type: EventTypes.EXIT, payload: { id: 6 } })
      eventBus.on(EventTypes.INIT, handle)
      eventBus.dispatch({ type: EventTypes.INIT, payload: { id: 7 } })

      expect(messages).to.have.lengthOf(4)
      expect(messages).to.eql([
        { type: EventTypes.INIT, payload: { id: 2 } },
        { type: EventTypes.EXIT, payload: { id: 4 } },
        { type: EventTypes.EXIT, payload: { id: 6 } },
        { type: EventTypes.INIT, payload: { id: 7 } },
      ])
    })
  })

  describe('subscriber', function () {
    it('Only event emitted after the subscriber register could be received', function () {
      const eventBus = new SimpleEventBus<EventTypes>()
      const [ messages, handle ] = createEventHandler()

      eventBus.dispatch({ type: EventTypes.INIT, payload: { id: 1 } })
      eventBus.subscribe(handle, false)
      eventBus.dispatch({ type: EventTypes.INIT, payload: { id: 2 } })
      eventBus.dispatch({ type: EventTypes.INIT, payload: { id: 3 } })

      expect(messages).to.have.lengthOf(2)
      expect(messages).to.eql([
        { type: EventTypes.INIT, payload: { id: 2 } },
        { type: EventTypes.INIT, payload: { id: 3 } },
      ])
    })

    it('Only be executed once if the subscriber registered with once flag `true`', function () {
      const eventBus = new SimpleEventBus<EventTypes>()
      const [ messages, handle ] = createEventHandler()

      eventBus.subscribe(handle, true)
      eventBus.dispatch({ type: EventTypes.INIT, payload: { id: 1 } })
      eventBus.dispatch({ type: EventTypes.INIT, payload: { id: 2 } })

      expect(messages).to.have.lengthOf(1)
      expect(messages).to.eql([
        { type: EventTypes.INIT, payload: { id: 1 } }
      ])
    })

    it('No matter what event will trigger the subscriber', function () {
      const eventBus = new SimpleEventBus<EventTypes>()
      const [ messages, handle ] = createEventHandler()

      eventBus.dispatch({ type: EventTypes.INIT, payload: { id: 1 } })
      eventBus.subscribe(handle, false)
      eventBus.dispatch({ type: EventTypes.INIT, payload: { id: 2 } })
      eventBus.dispatch({ type: EventTypes.EXIT, payload: { id: 3 } })
      eventBus.dispatch({ type: EventTypes.INIT, payload: { id: 4 } })
      eventBus.dispatch({ type: EventTypes.INIT, payload: { id: 5 } })

      expect(messages).to.have.lengthOf(4)
      expect(messages).to.eql([
        { type: EventTypes.INIT, payload: { id: 2 } },
        { type: EventTypes.EXIT, payload: { id: 3 } },
        { type: EventTypes.INIT, payload: { id: 4 } },
        { type: EventTypes.INIT, payload: { id: 5 } },
      ])
    })

    it('Event subscriber could be unregistered manually', function () {
      const eventBus = new SimpleEventBus<EventTypes>()
      const [ messages, handle ] = createEventHandler()

      eventBus.dispatch({ type: EventTypes.INIT, payload: { id: 1 } })
      eventBus.subscribe(handle, false)
      eventBus.dispatch({ type: EventTypes.INIT, payload: { id: 2 } })
      eventBus.dispatch({ type: EventTypes.EXIT, payload: { id: 3 } })
      eventBus.dispatch({ type: EventTypes.INIT, payload: { id: 4 } })
      eventBus.unsubscribe(handle)
      eventBus.dispatch({ type: EventTypes.INIT, payload: { id: 5 } })

      expect(messages).to.have.lengthOf(3)
      expect(messages).to.eql([
        { type: EventTypes.INIT, payload: { id: 2 } },
        { type: EventTypes.EXIT, payload: { id: 3 } },
        { type: EventTypes.INIT, payload: { id: 4 } },
      ])
    })

    it('Event subscriber can only be registered once', function () {
      const eventBus = new SimpleEventBus<EventTypes>()
      const [ messages, handle ] = createEventHandler()

      eventBus.dispatch({ type: EventTypes.INIT, payload: { id: 1 } })
      eventBus.subscribe(handle, true)
      eventBus.dispatch({ type: EventTypes.INIT, payload: { id: 2 } })
      eventBus.subscribe(handle, false)
      eventBus.dispatch({ type: EventTypes.EXIT, payload: { id: 3 } })
      eventBus.dispatch({ type: EventTypes.INIT, payload: { id: 4 } })
      eventBus.subscribe(handle, true)
      eventBus.unsubscribe(handle)
      eventBus.dispatch({ type: EventTypes.INIT, payload: { id: 5 } })
      eventBus.subscribe(handle, true)
      eventBus.dispatch({ type: EventTypes.INIT, payload: { id: 6 } })

      expect(messages).to.have.lengthOf(4)
      expect(messages).to.eql([
        { type: EventTypes.INIT, payload: { id: 2 } },
        { type: EventTypes.EXIT, payload: { id: 3 } },
        { type: EventTypes.INIT, payload: { id: 4 } },
        { type: EventTypes.INIT, payload: { id: 6 } },
      ])
    })
  })
})


function createEventHandler(): [
  SimpleEvent<EventTypes>[],
  SimpleEventHandler<EventTypes>,
] {
  const messages: SimpleEvent<EventTypes>[] = []
  const handle = (evt: SimpleEvent<EventTypes>) => messages.push(evt)
  return [messages, handle]
}
