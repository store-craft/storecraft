

/**
 * 
 * @description `pubsub` controller for `storecraft` events
 * 
 */
export class PubSub {

  /**
   * 
   * @type {Record<string, import("./types.public.js").PubSubSubscriber[]>}
   */
  #subscribers = {};


  constructor() {

  }

  /**
   * 
   * @description Dispatch a `storecraft` `event`
   * 
   * @param {import("./types.public.js").PubSubEvent} event 
   */
  async dispatch(event) {
    const subs = this.#subscribers[event] ?? [];
    for(const sub of subs) {
      await sub();
    }
  }

  /**
   * @description fetch subscribers list of event
   * 
   * @param {string} event 
   */
  #subscribersOf(event) {
    return (this.#subscribers[event] = this.#subscribers[event] ?? []);
  }

  /**
   * 
   * @description Subscribe to a `storecraft` event
   * 
   * @param {import("./types.public.js").PubSubEvent} event An event identifier
   * @param {import("./types.public.js").PubSubSubscriber} callback a `callback` 
   * event handler to invoke, can be a `promise`
   * 
   * 
   * @return {Function} A self invoking function that will unsubscribe the callback
   */
  on(event, callback) {
    this.#subscribersOf(event).push(callback);

    return () => {
      this.remove(event, callback);
    }
  }


  /**
   * @description unsubscribe to a `storecraft` event
   * 
   * @param {import("./types.public.js").PubSubEvent} event An event identifier
   * @param {import("./types.public.js").PubSubSubscriber} callback a `callback` 
   * event handler to remove
   */
  remove(event, callback) {
    this.#subscribers[event] = this.#subscribersOf(event).filter(
      cb => cb!==callback
    );
  }

}