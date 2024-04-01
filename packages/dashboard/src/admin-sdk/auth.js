import { StorecraftAdminSDK } from './index.js';
import { LS } from './utils.browser.js'
import { url } from './utils.api.fetch.js';
import { assert } from './utils.functional.js';

/**
 @typedef {import('@storecraft/core/v-api').ApiAuthResult} ApiAuthResult
 */

export default class Auth {

  /**
   * @typedef {(
   * [user, isAuthenticated] : [ApiAuthResult, boolean]) => void
   * } SubscriberCallback 
   */
  /**@type {Set<SubscriberCallback>} */
  #subscribers = new Set()
  /**@type {ApiAuthResult} */
  currentUser = undefined

  /**
   * 
   * @param {StorecraftAdminSDK} context 
   */
  constructor(context) {
    this.context = context
    // this.auth = context.firebase.auth
    this.USER_KEY = `storecraft_admin_${context.config.email}`
    this.db = context.db
    this.broadcast_channel = new BroadcastChannel(this.USER_KEY)
  }

  #save_user() {
    this.USER_KEY && LS.set(this.USER_KEY, this.currentUser);
  }

  init() {
    const that = this
    //
    this.broadcast_channel.onmessage = (e) => {
      this.#_update_and_notify_subscribers(e.data, false)
    }

    // load saved user
    this.currentUser = LS.get(this.USER_KEY)

    console.log('this.currentUser', this.currentUser);

    if (typeof window !== 'undefined') {
      window.addEventListener('blur', this.#save_user);
      window.addEventListener('beforeunload', this.#save_user)
    }

    // let's findout and re-auth of needed
    if(this.currentUser) {
      if(this.isAuthenticated) {
        this.#_update_and_notify_subscribers(this.currentUser, false);
      } else {
        // let's try to authenticate
        this.reAuthenticate();
      }
    }
  }

  /**
   * Get a working access-token
   */
  async working_access_token() {
    if(!this.isAuthenticated)
      await this.reAuthenticate();
    return this.currentUser.access_token.token;
  }

  /**
   * Perform re-authentication
   */
  async reAuthenticate() {
    const auth_res = await fetch(
      url(this.context.config, '/api/auth/refresh'),
      {
        method: 'post',
        body: JSON.stringify(
          {
            refresh_token: this.currentUser.refresh_token.token
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
      s([this.currentUser, this.isAuthenticated])
  }
  
  /**
   * @param {SubscriberCallback} cb 
   * @returns {() => void} unsubscribe function
   */
  add_sub = cb => {
    this.#subscribers.add(cb)
    return () => {
      this.#subscribers.delete(cb)
    }
  }

  get isAuthenticated() {
    const exp = this.currentUser?.access_token?.claims?.exp;
    return exp && exp*1000 > Date.now() - 60*1000;
  }

  /**
   * 
   * @param {ApiAuthResult} user 
   * @param {boolean} [broadcast=false] 
   */
  #_update_and_notify_subscribers = (user, broadcast=false) => {
    this.currentUser = user
    this.notify_subscribers();
    this.#save_user();
    if(broadcast)
      this.#_broadcast();
  }

  #_broadcast = () => {
    this.broadcast_channel.postMessage(
      this.currentUser
    );
  }

  
  /**
   * 
   * @param {string} email 
   * @param {string} password 
   * @returns 
   */
  signin_with_email_pass = async (email, password) => {
    // console.log('ep ', email, password)

    /** @type {import('@storecraft/core/v-api').ApiAuthSigninType} */
    const info = {
      email, password
    }

    // try {
      const res = await fetch(
        url(this.context.config, `/api/auth/signin`),
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

    // } catch(e) {

    // }

    // console.log('auth_result', payload)

    this.#_update_and_notify_subscribers(
      payload, true
      );
    return payload;
  }

  signout = async () => {
    console.log('signout');
    LS.set(this.USER_KEY, null)
    this.#_update_and_notify_subscribers(
      undefined, true
      );
  }

}