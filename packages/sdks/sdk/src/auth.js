/**
 * @import {
 *  ApiAuthChangePasswordType, ApiAuthResult, ApiAuthSigninType, ApiAuthSignupType, 
 *  ApiKeyResult, ApiQuery, AuthUserType, error,
 OAuthProvider,
 OAuthProviderCreateURIParams,
 OAuthProviderCreateURIResponse,
 OAuthProvidersList,
 SignWithOAuthProviderParams
 * } from '@storecraft/core/api'
 * @import { SdkConfigAuth } from '../types.js';
 */

import { api_query_to_searchparams } from '@storecraft/core/api/utils.query.js';
import { StorecraftSDK } from '../index.js';
import { fetchApiWithAuth, url } from './utils.api.fetch.js';
import { assert } from './utils.functional.js';


/**
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
 * @description `Storecraft` authentication module:
 * - Supports `subscribtion` to `auth` events
 * 
 */
export default class Auth {

  /**@type {Set<SubscriberCallback>} */
  #subscribers = new Set();

  /** @type {StorecraftSDK} */
  #sdk;

  /**
   * 
   * @param {StorecraftSDK} sdk 
   */
  constructor(sdk) {
    this.#sdk = sdk
  }

  /**
   * 
   * @description Get the current `auth` config, which is one of:
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
    return this.#sdk?.config?.auth;
  }

  /**
   * @param {SdkConfigAuth} value 
   */
  set currentAuth(value) {
    this.#sdk.config.auth = value;
  }


  init() {
  }

  /**
   * 
   * @description Get a working token, by the following strategy:
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
   * @description Perform re-authentication for `JWT` auth, which means:
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
        url(this.#sdk.config, '/auth/refresh'),
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

      /** @type {ApiAuthResult} */
      let payload = undefined;

      if(auth_res.ok) {
        payload = await auth_res.json();
      }

      this.#_update_and_notify_subscribers(payload);

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
        
        return exp && (Date.now() < (exp - 60)*1000);
      }
    }

    return false;
  }

  /**
   * 
   * @param {ApiAuthResult} user 
   */
  #_update_and_notify_subscribers = (user) => {
    this.currentAuth = user
    this.notify_subscribers();
  }


  /**
   * 
   * @param {string} email 
   * @param {string} password 
   * 
   * 
   * @returns {Promise<ApiAuthResult>}
   */
  signin = async (email, password) => {
    // console.log('ep ', email, password)

    /** @type {ApiAuthSigninType} */
    const info = {
      email, password
    }

    const res = await fetch(
      url(this.#sdk.config, `/auth/signin`),
      { 
        method: 'post',
        body: JSON.stringify(info),
        headers: {
          'Content-Type' : 'application/json'
        }
      }
    );
    
    if(!res.ok) {
      /** @type {error} */
      let error_payload = {
        messages: [
          {
            message: 'auth/error'
          }
        ]
      };

      try {
        error_payload = await res.json();
      } catch (e) {
      }

      throw error_payload;
    }    
    // assert(res.ok, 'auth/error2');

    /** @type {ApiAuthResult} */
    const payload = await res.json();

    // console.log('auth_result', payload)

    this.#_update_and_notify_subscribers(
      payload
    );

    return payload;
  }


  /**
   * 
   * @param {string} email 
   * @param {string} password 
   * @param {string} [firstname] 
   * @param {string} [lastname] 
   */
  signup = async (email, password, firstname, lastname) => {
    /** @type {ApiAuthSignupType} */
    const info = {
      email, password,
      firstname, lastname
    }

    const res = await fetch(
      url(this.#sdk.config, `/auth/signup`),
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

    this.#_update_and_notify_subscribers(
      payload
    );

    return payload;
  }


  /**
   * 
   * @param {ApiAuthChangePasswordType} params 
   */
  
  changePassword = async (params) => {

    const res = await fetch(
      url(this.#sdk.config, `/auth/change-password`),
      { 
        method: 'post',
        body: JSON.stringify(params),
        headers: {
          'Content-Type' : 'application/json'
        }
      }
    );
    
    if(!res.ok) {
      /** @type {error} */
      let error_payload = {
        messages: [
          {
            message: 'auth/error'
          }
        ]
      };

      try {
        error_payload = await res.json();
      } catch (e) {
      }

      throw error_payload;
    }

    /** @type {ApiAuthResult} */
    const payload = await res.json();

    this.#_update_and_notify_subscribers(
      payload
    );

    return payload;
  }



  signout = async () => {
    console.log('signout');

    this.#_update_and_notify_subscribers(
      undefined
    );

  }


  create_api_key = async () => {
    /** @type {ApiKeyResult} */
    const item = await fetchApiWithAuth(
      this.#sdk,
      '/auth/apikeys',
      {
        method: 'post'
      }
    );

    return item.apikey;
  }


  /**
   * 
   * 
   * @param {string} email_or_id
   */
  get_auth_user = async (email_or_id) => {
    /** @type {AuthUserType} */
    const item = await fetchApiWithAuth(
      this.#sdk,
      `/auth/users/${email_or_id}`,
      {
        method: 'get'
      }
    );

    return item;
  }

  /**
   * 
   * 
   * @param {string} email_or_id
   * 
   */
  remove_auth_user = async (email_or_id) => {
    return fetchApiWithAuth(
      this.#sdk,
      `/auth/users/${email_or_id}`,
      {
        method: 'delete'
      }
    );
  }

  /**
   * 
   * 
   * @param {ApiQuery<AuthUserType>} query
   * 
   */
  list_auth_users = async (query) => {
    const sq = api_query_to_searchparams(query);
    /** @type {AuthUserType[]} */
    const items = await fetchApiWithAuth(
      this.#sdk,
      `/auth/users?${sq.toString()}`,
      {
        method: 'get'
      }
    );
    return items;
  }


  list_api_keys_auth_users = async () => {

    /** @type {AuthUserType[]} */
    const items = await fetchApiWithAuth(
      this.#sdk,
      '/auth/apikeys',
      {
        method: 'get'
      }
    );

    return items;
  }

  identity_providers_list = async () => {
      /** @type {OAuthProvider[]} */
      const items = await fetchApiWithAuth(
        this.#sdk,
        '/auth/identity-providers',
        {
          method: 'get'
        }
      );
      return items;
  }

  /**
   * 
   * @param {OAuthProviderCreateURIParams} params 
   * @returns {Promise<OAuthProviderCreateURIResponse>}
   */
  identity_provider_get_authorization_uri = async (params) => {
    /** @type {OAuthProviderCreateURIResponse} */
    const result = await fetchApiWithAuth(
      this.#sdk,
      '/auth/identity-providers/create_authorization_uri',
      {
        method: 'post',
        body: JSON.stringify(params),
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    return result;
  }

  /**
   * @description Signup / Signin with an OAuth Identity Provider
   * @param {SignWithOAuthProviderParams} params 
   * @returns {Promise<ApiAuthResult>}
   */
  identity_provider_sign = async (params) => {

    /** @type {ApiAuthResult} */
    const result = await fetchApiWithAuth(
      this.#sdk,
      '/auth/identity-providers/sign',
      {
        method: 'post',
        body: JSON.stringify(params),
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    this.#_update_and_notify_subscribers(result);

    return result;
  }  
}