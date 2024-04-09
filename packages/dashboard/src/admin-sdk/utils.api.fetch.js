
import { api_query_to_searchparams } from '@storecraft/core/v-api/utils.query.js';
import { getSDK, StorecraftAdminSDK } from './index.js'
import { assert } from './utils.functional.js';

/**
 * 
 * @param {import("./index.js").StorecraftConfig} config 
 * @param {string} path 
 */
export const url = (config, path) => {
  let base = config?.endpoint
  assert(base, 'No Endpoint !');

  base = base.endsWith('/') ? base.slice(0, -1) : base;
  path = path.startsWith('/') ? path.slice(1) : path;

  return `${base}/api/${path}`;
}

/**
 * - Prepends `backend` endpoint. 
 * - Fetches with `authentication` middleware. 
 * - Refreshed `auth` if needed. 
 * - Throws a `json` representation of the `error`, if the request is `bad`
 * 
 * @template {any} R
 * @param { string } path relative path in api
 * @param {RequestInit} [init] request `init` type
 * @returns {Promise<R>}
 */ 
export const fetchApiWithAuth = async (path, init={}) => {

  const sdk = getSDK();
  await sdk.init();
  const token = await sdk.auth.working_access_token();

  const response = await fetch(
    url(sdk.config, path),
    {
      ...init,
      headers: {
        ...(init?.headers ?? {}),
        'Authorization': `Bearer ${token}`
      }
    }
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
 * @param {string} handle_or_id `handle` or `id`
 * @param {string} resource base path of resource
 * @returns {Promise<G>}
 */
export async function get(resource, handle_or_id) {
  return fetchApiWithAuth(
    `${resource}/${handle_or_id}`,
    {
      method: 'get'
    }
  );
}

/**
 * 
 * @template {any} U the upsert type
 * @param {string} resource base path of resource
 * @param {U} item Item to upsert
 * @returns {Promise<string>} id
 */
export async function upsert(resource, item) {
  return fetchApiWithAuth(
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
 * 
 * @param {string} resource base path of resource
 * @param {string} handle_or_id `handle` or `id`
 * @returns {Promise<boolean>}
 */
export async function remove(resource, handle_or_id) {
  return fetchApiWithAuth(
    `${resource}/${handle_or_id}`,
    {
      method: 'delete'
    }
  );
}


/**
 * @template {any} G Get type
 * @param {string} resource base path of resource
 * @param {import('@storecraft/core/v-api').ApiQuery} query 
 * @returns {Promise<G[]>}
 */
export async function list(resource, query) {
  const sq = api_query_to_searchparams(query);

  // console.log('sq', sq.toString())
  return fetchApiWithAuth(
    `${resource}?${sq.toString()}`,
    {
      method: 'get'
    }
  );
}

/**
 * A simple resource base `class` with `CRUD` helpers
 * @template {any} U upsert type
 * @template {any} G get type
 */
export class collection_base {
  /** @type {StorecraftAdminSDK} */
  #sdk = undefined;
  /** @type {string} */
  #base_name = undefined;

  /**
   * 
   * @param {StorecraftAdminSDK} sdk storecraft sdk
   * @param {string} base_name base name of resource type
   */
  constructor(sdk, base_name) {
    this.#sdk = sdk;
    this.#base_name = base_name;
  }

  /**
   * 
   * @param {string} handle_or_id `handle` or `id`
   * @returns {Promise<G>}
   */
  async get(handle_or_id) {
    return get(this.base_name, handle_or_id);
  }

  /**
   * 
   * @param {U} item Item to upsert
   * @returns {Promise<string>} id
   */
  async upsert(item) {
    return upsert(this.base_name, item);
  }

  /**
   * 
   * @param {string} handle_or_id `handle` or `id`
   * @returns {Promise<boolean>}
   */
  async delete(handle_or_id) {
    return remove(this.base_name, handle_or_id);
  }

  /**
   * 
   * @param {import('@storecraft/core/v-api').ApiQuery} query Query object
   * @returns {Promise<G[]>}
   */
  async list(query) {
    return list(this.base_name, query);
  }

  get base_name() {
    return this.#base_name;
  }

  get sdk() {
    return this.#sdk;
  }

}
