/**
 * @import { 
 *  GetDatabaseResponse, ListDatabasesResponse, QueryDatabaseParams, 
 *  QueryDatabaseResponse, RawDatabaseParams, RawDatabaseResponse 
 * } from './api.types.js';
 */


/**
 * @description consult these resources:
 * - [rest-api](https://developers.cloudflare.com/api/operations/cloudflare-d1-query-database)
 * - [ts impl](https://github.com/cloudflare/cloudflare-typescript/blob/main/src/resources/d1/database.ts#L247)
 * - [worker api](https://developers.cloudflare.com/d1/build-with-d1/d1-client-api/#dbbatch)
 */
export class Client {

  /**
   * 
   * @param {string} account_id 
   * @param {string} database_id 
   * @param {string} auth_token 
   */
  constructor(account_id, database_id, auth_token) {
    this.account_id = account_id;
    this.database_id = database_id;
    this.auth_token = auth_token;
  }

  /**
   * 
   * @param {string} [path] 
   */
  to_url = (path) => {
    const base = `https://api.cloudflare.com/client/v4/accounts/${this.account_id}/d1/database`;
    return path ? (base + path) : base;
  }
  
  /**
   * 
   * @returns {Promise<ListDatabasesResponse>}
   */
  list = async () => {

    const response = await fetch(
      this.to_url(), 
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${this.auth_token}`
        }
      }
    );

    return response.json();
  }


  /**
   * 
   * @returns {Promise<GetDatabaseResponse>}
   */
  get = async () => {

    const response = await fetch(
      this.to_url(`/${this.database_id}`), 
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${this.auth_token}`
        }
      }
    );

    return response.json();
  }

  /**
   * 
   * @param {QueryDatabaseParams} params
   * 
   * @returns {Promise<QueryDatabaseResponse>}
   */
  query = async (params) => {
    const url = this.to_url(`/${this.database_id}/query`);
    const response = await fetch(
      url, 
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${this.auth_token}`
        },
        body: JSON.stringify(params)
      }
    );

    const ctype = response.headers.get('Content-Type');
    if(!response.ok) {
      // console.log('error: query');
      // console.log('error: response', response);
      // console.log('error: headers', response.headers.get('Content-Type'));
      // console.log('error: url ', url);
      // // console.log('error: body ', params);
      console.log(response.statusText)
      console.log('error: headers', response.headers.get('Content-Type'));
      if(ctype.includes('text/plain')) {
        console.log('error: response text ', await response.text());
      
        return undefined;
      }
    }

    if(ctype.includes('json'))
      return await response.json();

    return undefined;
  }

  /**
   * 
   * @param {RawDatabaseParams} params
   * 
   * @returns {Promise<RawDatabaseResponse>}
   */
  raw = async (params) => {

    const response = await fetch(
      this.to_url(`/${this.database_id}/raw`), 
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${this.auth_token}`
        },
        body: JSON.stringify(params)
      }
    );

    return response.json();
  }

}