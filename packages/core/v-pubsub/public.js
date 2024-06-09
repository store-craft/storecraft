
/**
 * @typedef {import("./types.public.js").ON} ONN
 */

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
  #on(event, callback) {
    this.#subscribersOf(event).push(callback);

    return () => {
      this.remove(event, callback);
    }
  }



  /**
   * 
   * @type {ONN["on"]}
   */
  on = (event, callback) => {
    return this.#on(event, callback);
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


const pub = new PubSub();

pub.on(
  'a', v=> {

  }
)

pub.on('b', v => {})



/**
 * @overload
 * @param {'a'} e
 * @param {(v: 'a') => void} cb
 * @return {any}
 *
 * @overload
 * @param {'b'} e
 * @param {(v: 'b') => void} cb
 * @return {any}
 *
 * @param {'a' | 'b'} e
 * @param {((v: 'a') => void) | ((v: 'b') => void)} cb 
 */
function o(e, cb) {
  // ...
}


o('a', (v) => {
  v
})

o('b', v => {})

/**
 * @callback ConvertNumberToArray
 * @param {number} input
 * @return {number[]}
 *
 * @callback keepStrings
 * @param {string} input
 * @return {string}
 */

/**
 * @satisfies {ONN["on"]}
 */
function parse(event, callback) {
  if (typeof input === 'number') return [input]
  else return input
}

parse()

/**
 * @type {{
* (input: 'a') : any;
* (input: 'b') : any;
* }}
*/
const double = (input) => {
 
}

double()