/** 
 * @import { 
 *  EventPayload, PubSubEvent, PubSubSubscriber, UnsubscribeFunction,
 *  events 
 * } from "./types.public.js" */
import { App } from "../index.js";

/**
 * @description `pubsub` controller for `storecraft` events
 * @template {App} [AppType=App]
 */
export class PubSub {

  /**
   * @type {Record<string, PubSubSubscriber[]>}
   */
  #subscribers = {};
  /**
   * @type {AppType}
   */
  #app;

  /**
   * @param {AppType} app 
   */
  constructor(app) {
    this.#app = app;
  }

  /**
   * @description Does a `storecraft` `event` has handlers ?
   * @template {PubSubEvent | string} [E=PubSubEvent]
   * @param {E} event 
   */
  has(event) {
    return (
      (this.#subscribersOf(event).length > 0) ||
      (this.#subscribersOf('*').length > 0)
    );
  }

  /**
   * @description Dispatch a `storecraft` `event` {@link PubSubEvent}.
   * Events are dispatched searially with **LIFO**, meaning
   * - The last subscriber, has the highest priority and gets notified first.
   * - Also, you can use `stopPropagation()` method to stop the event from propagating
   * to other subscribers.
   * @template {PubSubEvent | string} [E=PubSubEvent]
   * @param {E} event a `storecraft` event type
   * @param {E extends PubSubEvent ? events[E] : any} [payload] extra payload to dispatch
   * @see {@link PubSubEvent}
   */
  async dispatch(event, payload) {
    try {
      let is_event_stopped = false;
      /** @type {EventPayload<E extends PubSubEvent ? events[E] : any, AppType, E>} */
      const event_payload = {
        event,
        payload,
        app: this.#app,
        stopPropagation: () => {
          is_event_stopped = true;
        }
      }

      { // dispatch event
        const subs = this.#subscribers[event] ?? [];
        for(let ix=subs.length-1; ix>=0; --ix) {
          if(is_event_stopped)
            break;
          
          await subs.at(ix)(event_payload);
        }
      }
      { // dispatch to subscribers who are listening to all events
        const subs = this.#subscribers['*'] ?? [];
        for(let ix=subs.length-1; ix>=0; --ix) {
          if(is_event_stopped)
            break;
          
          await subs.at(ix)(event_payload);
        }
      }
    } catch(e) {
      console.log(e)
    }
  }

  /**
   * @description fetch subscribers list of event
   * @param {string} event 
   */
  #subscribersOf(event) {
    return (this.#subscribers[event] = this.#subscribers[event] ?? []);
  }

  /**
   * @description Subscribe to a `storecraft` event
   * @param {PubSubEvent | string} event An event identifier
   * @param {PubSubSubscriber} callback a `callback` 
   * event handler to invoke, can be a `promise`
   * @returns {UnsubscribeFunction} A self invoking function that will unsubscribe the callback
   */
  #on(event, callback) {
    this.#subscribersOf(event).push(callback);

    return () => {
      this.remove(event, callback);
    }
  }

  /**
   * @description Subscribe to a `storecraft` event
   * @template {PubSubEvent | string} [E=PubSubEvent]
   * @param {E} event
   * @param {E extends PubSubEvent ? PubSubSubscriber<events[E]> : PubSubSubscriber<any>} callback
   */
  on = (event, callback) => {
    return this.#on(event, callback);
  }

  /**
   * @description unsubscribe to a `storecraft` event
   * @template {PubSubEvent | string} [E=PubSubEvent]
   * @param {E} event An event identifier
   * @param {E extends PubSubEvent ? PubSubSubscriber<events[E]> : PubSubSubscriber<any>} callback a `callback` 
   * event handler to remove
   */
  remove = (event, callback) => {
    this.#subscribers[event] = this.#subscribersOf(event).filter(
      cb => cb!==callback
    );
  }
}

