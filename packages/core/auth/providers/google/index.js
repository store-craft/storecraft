/**
 * @import { 
 *  exchange_authorization_for_token_body, 
 *  exchange_authorization_for_token_response, 
 *  token_info_response 
 * } from './types.private.js';
 * @import { Config } from './types.public.js';
 * @import { AuthProvider } from '../../types.js';
 * @import { ENV } from '../../../types.public.js';
 */
import { assert } from '../../../api/utils.func.js'

/**
 * @description Google Auth Provider
 * 
 * based on:
 *
 * - https://developers.google.com/identity/protocols/oauth2/web-server#httprest
 * - https://cloud.google.com/docs/authentication/token-types
 * - https://developers.google.com/identity/sign-in/web/backend-auth
 * 
 * @implements {AuthProvider<Config>}
 */
export class GoogleAuth {
  /** @satisfies {ENV<Config>} */
  static EnvConfig = /** @type{const} */ ({
    client_id: 'IDP_GOOGLE_CLIENT_ID',
    client_secret: 'IDP_GOOGLE_CLIENT_SECRET'
  });

  authorization_url = 'https://accounts.google.com/o/oauth2/v2/auth'
  token_url = 'https://oauth2.googleapis.com/token'
  validate_url = 'https://oauth2.googleapis.com/tokeninfo'
  name = 'Google'
  logo_url = `data:image/svg+xml;charset=utf-8,<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" xmlns:xlink="http://www.w3.org/1999/xlink" style="display: block;"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path><path fill="none" d="M0 0h48v48H0z"></path></svg>`
  description = 'Signin / Signup with Google'

  /** @param {Config} [config] */
  constructor(config={}) {
    this.config = config;
  }


  /** @type {AuthProvider["init"]} */
  init = (app) => {
    this.config.client_id ??= app.platform.env[GoogleAuth.EnvConfig.client_id];
    this.config.client_secret ??= app.platform.env[GoogleAuth.EnvConfig.client_secret];
  }

  /** @type {AuthProvider<Config>["generateAuthUri"]} */
  generateAuthUri = async (redirect_uri='', extra=undefined) => {
    const params = new URLSearchParams({
      client_id: this.config.client_id,
      redirect_uri,
      access_type: 'offline',
      response_type: 'code',
      state: 'state',
      scope: [
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
      ].join(' ')
    });

    return `${this.authorization_url}?${params.toString()}`;
  }
      
  /** @type {AuthProvider<Config>["signWithAuthorizationResponse"]} */
  async signWithAuthorizationResponse(params) {
    assert(
      params?.authorization_response?.code,
      `sign_with_authorization_response:: No \`code\` property found for provider ${this.name}`
    )
    /** @type {exchange_authorization_for_token_body} */
    const data = {
      ...params.authorization_response,
      code: params.authorization_response.code,
      client_id: this.config.client_id,
      client_secret: this.config.client_secret,
      redirect_uri: params.redirect_uri,
      grant_type: 'authorization_code',
    };

    // console.log(data);

    // exchange authorization code for access token & id_token

    const response = await fetch(
      this.token_url, 
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );

    /** @type {exchange_authorization_for_token_response} */
    const json = await response.json();
    // console.log('sign_with_authorization_response:: ', json)
    assert(
      response.ok,
      json
    );

    { // validate id-token, we can do it in house but we need the
      // public google certs, so we alway need a fetch call
      const response = await fetch(
        this.validate_url + '?id_token=' + json.id_token
      );

      /** @type {token_info_response} */
      const claims = await response.json();

      assert(
        response.ok,
        claims
      );

      return {
          email: claims.email,
          firstname: claims.given_name,
          lastname: claims.family_name,
          picture: claims.picture,
      }
    }
  }
}