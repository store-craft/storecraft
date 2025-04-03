/**
 * @import { error, ApiQuery } from '@storecraft/core/api'
 * @import { StorecraftSDK } from '../index.js'
 * @import { StorecraftSDKConfig } from '../types.js'
 */
import { 
  api_query_to_searchparams 
} from '@storecraft/core/api/utils.query.js';


/**
 * 
 * @param {StorecraftSDKConfig} config 
 * @param {string} path 
 * @param {URLSearchParams} [query] url search params
 */
export const url = (config, path, query) => {
  let base = config?.endpoint?.trim();

  base = base?.endsWith('/') ? base.slice(0, -1) : base;
  path = path?.startsWith('/') ? path.slice(1) : path;

  if(query?.size) {
    path = path?.endsWith('/') ? path.slice(0, -1) : path;
    path += '?' + query.toString();
  }

  return base ? `${base}/api/${path}` : `/api/${path}`;
}


/**
 * @description 
 * - Prepends `backend` endpoint. 
 * - Fetches with `authentication` middleware. 
 * - Refreshed `auth` if needed. 
 * 
 * @param {StorecraftSDK} sdk 
 * @param {string} path relative path in api
 * @param {RequestInit} [init] request `init` type
 * @param {URLSearchParams} [query] url search params
 * 
 * @returns {Promise<Response>}
 */ 
export const fetchOnlyApiResponseWithAuth = async (
  sdk, path, init={}, query=undefined
) => {

  const auth_token = await sdk.auth.working_auth_token();
  const auth_header_value = (
    sdk.auth.authStrategy==='apikey' ? 'Basic' : 'Bearer'
  ) + ` ${auth_token}`;
  

  const response = await fetch(
    url(sdk.config, path, query),
    {
      ...init,
      headers: {
        ...(init?.headers ?? {}),
        'Authorization': auth_header_value
      }
    }
  );

  return response;
}


/**
 * @description 
 * - Prepends `backend` endpoint. 
 * - Fetches with `authentication` middleware. 
 * - Refreshed `auth` if needed. 
 * - Throws a `json` representation of the `error`, 
 * if the request is `bad`
 * 
 * @template {any} [R=any]
 * 
 * @param {StorecraftSDK} sdk
 * @param {string} path relative path in api
 * @param {RequestInit} [init] request `init` type
 * @param {URLSearchParams} [query] url search params
 * 
 * @throws {error}
 * 
 * @returns {Promise<R>}
 */ 
export const fetchApiWithAuth = async (
  sdk, path, init={}, query=undefined
) => {

  const response = await fetchOnlyApiResponseWithAuth(
    sdk, path, init, query
  );

  // console.log('fetchApiWithAuth::response', response)

  const isok = response.ok;
  let payload = undefined;

  try {
    payload = await response.json();
  } catch(e) {
    console.log('fetchApiWithAuth.json()', e)
  }

  if(!isok)
    throw payload;

  return payload;
}


/**
 * @template {any} G Get type
 * 
 * 
 * @param {StorecraftSDK} sdk
 * @param {string} handle_or_id `handle` or `id`
 * @param {string} resource base path of resource
 * 
 * 
 * @returns {Promise<G>}
 */
export async function get_from_collection_resource(sdk, resource, handle_or_id) {
  return fetchApiWithAuth(
    sdk, 
    `${resource}/${handle_or_id}`,
    {
      method: 'get'
    }
  );
}


/**
 * 
 * @template {any} U the upsert type
 * 
 * 
 * @param {StorecraftSDK} sdk
 * @param {string} resource base path of resource
 * @param {U} item Item to upsert
 * 
 * 
 * @returns {Promise<string>} id
 */
export async function upsert_to_collection_resource(sdk, resource, item) {
  return fetchApiWithAuth(
    sdk, 
    `${resource}`,
    {
      method: 'post',
      body: JSON.stringify(item),
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
}

/**
 * @description Count the number of items in a query
 * @template G
 * @param {StorecraftSDK} sdk
 * @param {string} resource base path of resource
 * @param {ApiQuery<G>} [query] the query
 * @returns {Promise<number>} count
 */
export async function count_query_of_resource(sdk, resource, query) {
  const sq = api_query_to_searchparams(query);
  return fetchApiWithAuth(
    sdk, 
    `${resource}/count_query?${sq.toString()}`,
    {
      method: 'get',
    }
  ).then((result) => Number(result.count));
}

/**
 * 
 * @param {StorecraftSDK} sdk
 * @param {string} resource base path of resource
 * @param {string} handle_or_id `handle` or `id`
 * 
 * 
 * @returns {Promise<boolean>}
 */
export async function remove_from_collection_resource(sdk, resource, handle_or_id) {
  return fetchApiWithAuth(
    sdk, 
    `${resource}/${handle_or_id}`,
    {
      method: 'delete'
    }
  );
}


/**
 * @description Invoke `api` endpoint that requires use of `query`
 * object. I named it `list` because it usually entails list op.
 * 
 * 
 * @template {any} G Get type
 * 
 * 
 * @param {StorecraftSDK} sdk
 * @param {string} resource base path of resource
 * @param {ApiQuery<G>} [query] 
 * 
 * 
 * @returns {Promise<G[]>}
 */
export async function list_from_collection_resource(sdk, resource, query={}) {
  const sq = api_query_to_searchparams(query);

  // console.log('sq', sq.toString())
  return fetchApiWithAuth(
    sdk, 
    `${resource}?${sq.toString()}`,
    {
      method: 'get'
    }
  );
}


/**
 * @description A simple resource base `class` with `CRUD` helpers
 * 
 * @template {any} U upsert type
 * @template {any} G get type
 */
export class collection_base {
  
  /** @type {StorecraftSDK} */
  #sdk = undefined;
  
  /** @type {string} */
  #base_name = undefined;

  /**
   * 
   * @param {StorecraftSDK} sdk storecraft sdk
   * @param {string} base_name base path of resource type
   */
  constructor(sdk, base_name) {
    this.#sdk = sdk;
    this.#base_name = base_name;
  }

  
  /**
   * 
   * @param {string} handle_or_id `handle` or `id`
   * 
   * 
   * @returns {Promise<G>}
   */
  async get(handle_or_id) {
    return get_from_collection_resource(this.sdk, this.base_name, handle_or_id);
  }

  /**
   * 
   * @param {U} item Item to upsert
   * 
   * 
   * @returns {Promise<string>} id
   */
  async upsert(item) {
    return upsert_to_collection_resource(this.sdk, this.base_name, item);
  }

  /**
   * 
   * @param {string} handle_or_id `handle` or `id`
   * 
   * 
   * @returns {Promise<boolean>}
   */
  async remove(handle_or_id) {
    return remove_from_collection_resource(this.sdk, this.base_name, handle_or_id);
  }

  /**
   * @param {ApiQuery<G>} query Query object
   * @returns {Promise<G[]>}
   */
  async list(query) {
    return list_from_collection_resource(this.sdk, this.base_name, query);
  }

  /**
   * @description Count the number of items in a query
   * @param {ApiQuery<G>} query Query object
   */
  async count_query(query) {
    return count_query_of_resource(this.sdk, this.base_name, query);
  }

  get base_name() {
    return this.#base_name;
  }

  get sdk() {
    return this.#sdk;
  }

}
