import { StorecraftSDK } from '../index.js';
import { url } from './utils.api.fetch.js';
import { assert } from './utils.functional.js';


/**
 * 
 * @typedef {import('../index.js').SdkConfigAuth} SdkConfigAuth
 * 
 * 
 * @typedef {object} SubscriberCallbackPayload
 * @prop {SdkConfigAuth} auth
 * @prop {boolean} isAuthenticated
 * 
 * 
 * @typedef {(payload: SubscriberCallbackPayload) => void
 * } SubscriberCallback Subscribe to `auth` updates for `JWT` auth
 * 
 */
  
  
/**
 * `Storecraft` authentication module:
 * - Supports `subscribtion` to `auth` events
 * 
 */
export default class Auth {

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

  /**
   * 
   * Get the current `auth` config, which is one of:
   * 
   * 1. `JWT` with `access_token`, `refresh_token`, `claims`
   * 2. `Api Key` with a single value, which can be used as is in:
   *    - `Authorization: Basic <api-key>`, or
   *    - `X-API-KEY: <api-key>`
   * 
   * Notes:
   * 
   * **JWT** is always recommended and is performing faster once you gain an
   * `access_token`.
   * 
   * **Api Key** represents a user which always makes the `backend` to verify
   * the authentication and authorization and therefore may be slower, because
   * the `backend` will verify against the database.
   * 
   */
  get currentAuth() {
    return this.context?.config?.auth;
  }

  /**
   * @param {import('../index.js').SdkConfigAuth} value 
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
   * 
   * Get a working token, by the following strategy:
   * 
   * - If you are in `JWT` strategy:
   *    - If the current `access_token` will expire soon or is already expired
   *    - then, use `refresh_token` to re-authenticate
   * 
   * - If you are in `Api Key` strategy, simply returns the `apikey`
   * 
   * @param {boolean} [force_reauth=false] 
   * 
   */
  async working_auth_token(force_reauth=false) {
    if(this.currentAuth) {
      if('apikey' in this.currentAuth) {
        return this.currentAuth.apikey;
      }
      else if('access_token' in this.currentAuth) {
        if(force_reauth || !this.isAuthenticated)
          await this.reAuthenticateIfNeeded(force_reauth);
        return this.currentAuth.access_token.token;
      }
    }

    return undefined;
  }


  /**
   * 
   * Perform re-authentication for `JWT` auth, which means:
   * 
   * - use the `refresh_token` to gain a new `access_token`
   * 
   * @param {boolean} [force=false] 
   * 
   */
  async reAuthenticateIfNeeded(force=false) {
    if(!this.currentAuth)
      return;
    
    if(this.isAuthenticated && !force)
      return;

    if('access_token' in this.currentAuth) {
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

      /** @type {import('@storecraft/core/v-api').ApiAuthResult} */
      let payload = undefined;

      if(auth_res.ok) {
        payload = await auth_res.json();
      }

      this.#_update_and_notify_subscribers(payload, false);

      return payload;
    }
  }

  notify_subscribers = () => {
    // console.log('this.isAuthenticated', this.isAuthenticated)
    for(let s of this.#subscribers) {
      s(
        {
          auth: this.currentAuth, 
          isAuthenticated: this.isAuthenticated
        }
      );
    
    }
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

  get authStrategy() {
    if(this.currentAuth) {
      if('apikey' in this.currentAuth)
        return 'apikey';
      else if('access_token' in this.currentAuth)
        return 'jwt';
    }

    return 'unknown';
  }

  get isAuthenticated() {
    
    if(this.currentAuth) {
      if('apikey' in this.currentAuth) {
        return Boolean(this.currentAuth.apikey);
      }
      else if('access_token' in this.currentAuth) {
        const exp = this.currentAuth?.access_token?.claims?.exp;
        return exp && (exp*1000 > Date.now() - 60*1000);
      }
    }

    return false;
  }

  /**
   * 
   * @param {import('@storecraft/core/v-api').ApiAuthResult} user 
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
   * @returns {Promise<import('@storecraft/core/v-api').ApiAuthResult>}
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

    /** @type {import('@storecraft/core/v-api').ApiAuthResult} */
    const payload = await res.json();

    // console.log('auth_result', payload)

    this.#_update_and_notify_subscribers(
      payload, true
    );

    return payload;
  }


  /**
   * 
   * @param {string} email 
   * @param {string} password 
   */
  signup = async (email, password) => {
    /** @type {import('@storecraft/core/v-api').ApiAuthSignupType} */
    const info = {
      email, password
    }

    const res = await fetch(
      url(this.context.config, `/auth/signup`),
      { 
        method: 'post',
        body: JSON.stringify(info),
        headers: {
          'Content-Type' : 'application/json'
        }
      }
    );
    
    assert(res.ok, 'auth/error');

    /** @type {import('@storecraft/core/v-api').ApiAuthResult} */
    const payload = await res.json();

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