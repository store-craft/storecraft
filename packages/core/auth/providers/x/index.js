/**
 * @import { Config } from './types.public.js';
 * @import { AuthProvider } from '../../types.js';
 * @import { ENV } from '../../../types.public.js';
 */
import { assert, assert_async } from '../../../api/utils.func.js'
import { Base64 } from '../../../crypto/base64.js';
import { OAuthV1 } from '../../../crypto/oauth-1.0a.js';

/**
 * @description X Auth Provider using OAuthV1 flow
 * 
 * based on:
 *
 * 
 * @implements {AuthProvider<Config>}
 */
export class XAuth {
  /** @satisfies {ENV<Config>} */
  static EnvConfig = /** @type{const} */ ({
    consumer_api_key: 'IDP_X_CONSUMER_API_KEY',
    consumer_api_secret: 'IDP_X_CONSUMER_API_SECRET'
  });

  authorization_url = 'https://x.com/i/oauth2/authorize'
  token_url = 'https://api.x.com/2/oauth2/token'
  name = 'X'
  logo_url = `data:image/svg+xml;charset=utf-8,<svg fill="white" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" ><g><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></g></svg>`
  description = 'Signin / Signup with X'

  /** @param {Config} [config] */
  constructor(config={}) {
    this.config = config;
  }


  /** @type {AuthProvider["init"]} */
  init = (app) => {
    this.config.consumer_api_key ??= app.platform.env[XAuth.EnvConfig.consumer_api_key];
    this.config.consumer_api_secret ??= app.platform.env[XAuth.EnvConfig.consumer_api_secret];
  }

  /** @type {AuthProvider<Config>["generateAuthUri"]} */
  generateAuthUri = async (redirect_uri='', extra=undefined) => {
    const oauth = new OAuthV1({
      consumer: {
        key: this.config.consumer_api_key,
        secret: this.config.consumer_api_secret
      },
      signature_method: 'HMAC-SHA1',
      async hash_function(baseString, key) {
        // encoder to convert string to Uint8Array
        var enc = new TextEncoder();
    
        const cryptKey = await crypto.subtle.importKey(
          'raw',
          enc.encode(key),
          { name: 'HMAC', hash: 'SHA-1' },
          false,
          ['sign', 'verify'],
        )
    
        const signature = await crypto.subtle.sign(
          { name: 'HMAC', hash: 'SHA-1' },
          cryptKey,
          enc.encode(baseString)
        )
    
        let b = new Uint8Array(signature);
        // base64 digest
        return Base64.fromUint8Array(b);
      }
    })
    
    const auth = await oauth.authorize(
      {
        method: 'POST',
        url: 'https://api.x.com/oauth/request_token',
        data: {
          oauth_callback: redirect_uri
        }
      },
    );

    const auth_header = oauth.toHeader(auth);

    // console.log({auth_header});

    const response = await fetch(
      'https://api.x.com/oauth/request_token',
      {
        method: 'POST',
        headers: {
          ...auth_header
        }
      }
    );
    
    await assert_async(
      response.ok,
      () => response.json()
    );

    // console.log({response})

    const obj_text = await response.text();
    const obj = /** @type {{oauth_token: string, oauth_callback_confirmed: string, oauth_token_secret: string}} */ (
      Object.fromEntries(new URLSearchParams(obj_text))
    );

    assert(
      obj.oauth_callback_confirmed,
      obj
    );

    return `https://api.x.com/oauth/authorize?oauth_token=${obj.oauth_token}`
  }
      
  /** @type {AuthProvider<Config>["signWithAuthorizationResponse"]} */
  async signWithAuthorizationResponse(params) {
    const data = {
      oauth_verifier: params.authorization_response.oauth_verifier,
      oauth_token: params.authorization_response.oauth_token,
    };

    const oauth = new OAuthV1({
      consumer: {
        key: this.config.consumer_api_key,
        secret: this.config.consumer_api_secret
      },
      signature_method: 'HMAC-SHA1',
      async hash_function(baseString, key) {
        // encoder to convert string to Uint8Array
        var enc = new TextEncoder();
    
        const cryptKey = await crypto.subtle.importKey(
          'raw',
          enc.encode(key),
          { name: 'HMAC', hash: 'SHA-1' },
          false,
          ['sign', 'verify'],
        )
    
        const signature = await crypto.subtle.sign(
          { name: 'HMAC', hash: 'SHA-1' },
          cryptKey,
          enc.encode(baseString)
        )
    
        let b = new Uint8Array(signature);
        // base64 digest
        return Base64.fromUint8Array(b);
      }
    })
    
    const auth = await oauth.authorize(
      {
        method: 'POST',
        url: 'https://api.x.com/oauth/access_token',
        data: {
          // oauth_token: data.oauth_token,
          oauth_verifier: data.oauth_verifier,
        }
      }, {
        key: data.oauth_token,
        secret: undefined
      }
    );


    const auth_header = oauth.toHeader(auth);
    // console.log({auth_header});

    const response = await fetch(
      'https://api.x.com/oauth/access_token',
      {
        method: 'POST',
        headers: {
          ...auth_header,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: (new URLSearchParams(
          {
            oauth_verifier: data.oauth_verifier,
            // oauth_token: data.oauth_token,
            // oauth_consumer_key: this.consumer_app_key
          }
        )).toString()
      }
    );

    await assert_async(
      response.ok,
      () => response.text()
    );

    const response_text = await response.text();
    const response_obj = /** @type {{oauth_token: string, oauth_token_secret: string}} */ (
      Object.fromEntries(new URLSearchParams(response_text))
    );

    // console.log({response_obj})
    {
      // now get the credentials with v1
      // /1.1/account/verify_credentials.json
      const oauth = new OAuthV1({
        consumer: {
          key: this.config.consumer_api_key,
          secret: this.config.consumer_api_secret
        },
        signature_method: 'HMAC-SHA1',
        async hash_function(baseString, key) {
          // encoder to convert string to Uint8Array
          var enc = new TextEncoder();
      
          const cryptKey = await crypto.subtle.importKey(
            'raw',
            enc.encode(key),
            { name: 'HMAC', hash: 'SHA-1' },
            false,
            ['sign', 'verify'],
          )
      
          const signature = await crypto.subtle.sign(
            { name: 'HMAC', hash: 'SHA-1' },
            cryptKey,
            enc.encode(baseString)
          )
      
          let b = new Uint8Array(signature);
          // base64 digest
          return Base64.fromUint8Array(b);
        }
      });

      const auth = await oauth.authorize(
        {
          method: 'GET',
          url: 'https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true',
        }, {
          key: response_obj.oauth_token,
          secret: response_obj.oauth_token_secret,
        }
      );

      const auth_header = oauth.toHeader(auth);
      
      // console.log({auth_header})

      // https://developer.x.com/en/docs/x-api/v1/accounts-and-users/manage-account-settings/api-reference/get-account-verify_credentials
      const response = await fetch(
        'https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true',
        {
          method: 'GET',
          headers: {
            ...auth_header,
          },
        }
      );

      // console.log({response})

      await assert_async(
        response.ok,
        () => response.json()
      );

      /** @type {{name: string, email: string, profile_image_url: string}} */
      const user = await response.json();

      console.log({user})

      return {
        email: user.email,
        firstname: user.name.split(' ').at(0).trim(),
        lastname: user.name.split(' ').at(1)?.trim() ?? '',
        picture: user.profile_image_url,
      }
    }
  }
}