/**
 * @import { Config } from './types.public.js'
*/

export const endpoints = {
  test: 'https://api-m.sandbox.paypal.com',
  prod: 'https://api-m.paypal.com'
}

/**
 * @param {Config} config 
 */
export const get_endpoint = (config) => endpoints[config.env==='test' ? 'test': 'prod'];

/** @param {Response} response */
export const throw_bad_response = async (response) => {
  if(!response.ok) throw new Error(await response.text());
}

/**
 * get access token if it has expired
 * 
 * @param {Config} config 
 * @returns {Promise<{ access_token: string, endpoint: string }>}
 */
export const getAccessToken = async (config) => {

  const { client_id, secret } = config;
  const endpoint = get_endpoint(config);

  const auth = btoa(client_id + ':' + secret);
  // const expired = current_auth.expires_at - Date.now() <= 10*1000
  // if(!expired)
  //   return current_auth.latest_auth_response.access_token

  const response = await fetch(
    `${endpoint}/v1/oauth2/token`, 
    {
      method: 'post',
      body: 'grant_type=client_credentials',
      headers: {
        Authorization: `Basic ${auth}`,
      },
    }
  );
 
  await throw_bad_response(response);

  const jsonData = await response.json()
  // current_auth.latest_auth_response = jsonData
  return {
    endpoint,
    access_token: jsonData.access_token
  }
}

/**
 * make a request, taking into account auth and endpoints for test and prod
 * @param {Config} config 
 * @param {string} path relative path, i.e `v2/checkout/orders/..`
 * @param {RequestInit} init 
 */
export const fetch_with_auth = async (config, path, init={}) => {
  const { access_token, endpoint } = await getAccessToken(config);
  
  return fetch(
    `${endpoint}/${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`,
      },
    }
  );
}