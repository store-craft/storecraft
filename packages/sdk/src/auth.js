import { StorecraftSDK } from '../index.js';
import { url } from './utils.api.fetch.js';
import { assert } from './utils.functional.js';

/**
 @typedef {import('@storecraft/core/v-api').ApiAuthResult} ApiAuthResult
 */

/**
 * `Storecraft` authentication module:
 * - Supports `subscribtion` to `auth` events
 * 
 */
export default class Auth {

  /**
   * @typedef {(
   *  [user, isAuthenticated] : [ApiAuthResult, boolean]) => void
   * } SubscriberCallback 
   */


  /**@type {Set<SubscriberCallback>} */
  #subscribers = new Set();


  /**
   * 
   * @param {StorecraftSDK} context 
   */
  constructor(context) {
    this.context = context
    // this.USER_KEY = `storecraft_admin_${context.config.email}`
    // this.broadcast_channel = new BroadcastChannel(this.USER_KEY)
  }

  get currentAuth() {
    return this.context?.config?.auth;
  }

  /**
   * @param {ApiAuthResult} value 
   */
  set currentAuth(value) {
    this.context.config.auth = value;
  }


  init() {
    // const that = this
    // //
    // this.broadcast_channel.onmessage = (e) => {
    //   this.#_update_and_notify_subscribers(e.data, false)
    // }

    // // load saved user
    // this.currentAuth = LS.get(this.USER_KEY)

    // console.log('this.currentUser', this.currentAuth);

    // if (typeof window !== 'undefined') {
    //   window.addEventListener('blur', this.#save_user);
    //   window.addEventListener('beforeunload', this.#save_user)
    // }

    // // let's findout and re-auth of needed
    // if(this.currentAuth) {
    //   if(this.isAuthenticated) {
    //     this.#_update_and_notify_subscribers(
    //       this.currentAuth, false
    //     );
    //   } else {
    //     // let's try to authenticate
    //     this.reAuthenticate();
    //   }
    // }
  }

  /**
   * Get a working access-token
   */
  async working_access_token() {
    if(!this.isAuthenticated)
      await this.reAuthenticate();
    return this.currentAuth.access_token.token;
  }

  /**
   * Perform re-authentication
   */
  async reAuthenticate() {
    const auth_res = await fetch(
      url(this.context.config, '/auth/refresh'),
      {
        method: 'post',
        body: JSON.stringify(
          {
            refresh_token: this.currentAuth.refresh_token.token
          }
        ),
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    /** @type {ApiAuthResult | undefined} */
    let payload = undefined;

    if(auth_res.ok) {
      payload = await auth_res.json();
    }

    this.#_update_and_notify_subscribers(payload, false);
    return payload;
  }

  notify_subscribers = () => {
    // console.log('this.isAuthenticated', this.isAuthenticated)
    for(let s of this.#subscribers)
      s([this.currentAuth, this.isAuthenticated])
  }
  
  /**
   * @param {SubscriberCallback} cb 
   * @returns {() => void} unsubscribe function
   */
  add_sub = cb => {
    this.#subscribers.add(cb);

    return () => {
      this.#subscribers.delete(cb)
    }
  }

  get isAuthenticated() {
    const exp = this.currentAuth?.access_token?.claims?.exp;
    return exp && exp*1000 > Date.now() - 60*1000;
  }

  /**
   * 
   * @param {ApiAuthResult} user 
   * @param {boolean} [broadcast=false] 
   */
  #_update_and_notify_subscribers = (user, broadcast=false) => {
    this.currentAuth = user
    this.notify_subscribers();
    if(broadcast)
      this.#_broadcast();
  }

  #_broadcast = () => {
    // this.broadcast_channel.postMessage(
    //   this.currentUser
    // );
  }

  /**
   * 
   * @param {string} email 
   * @param {string} password 
   * 
   * @returns {Promise<ApiAuthResult>}
   */
  signin = async (email, password) => {
    // console.log('ep ', email, password)

    /** @type {import('@storecraft/core/v-api').ApiAuthSigninType} */
    const info = {
      email, password
    }

    const res = await fetch(
      url(this.context.config, `/auth/signin`),
      { 
        method: 'post',
        body: JSON.stringify(info),
        headers: {
          'Content-Type' : 'application/json'
        }

      }
    );
    
    assert(res.ok, 'auth/error');

    /** @type {ApiAuthResult} */
    const payload = await res.json();

    // console.log('auth_result', payload)

    this.#_update_and_notify_subscribers(
      payload, true
    );

    return payload;
  }

  signout = async () => {
    console.log('signout');

    this.#_update_and_notify_subscribers(
      undefined, true
    );
  }

}