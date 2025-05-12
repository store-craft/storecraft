/**
 * @import { 
 * } from './types.private.js';
 * @import { Config } from './types.public.js';
 * @import { AuthProvider } from '../../types.js';
 * @import { ENV } from '../../../types.public.js';
 * @import { JWTClaims } from '../../../crypto/jwt.js';
 */
import { assert } from '../../../api/utils.func.js'
import { parse_jwt } from '../../../crypto/jwt.js';


/**
 * @description Facebook Auth Provider
 * 
 * based on,
 * - https://developers.facebook.com/docs/facebook-login/guides/advanced/manual-flow/
 * 
 * @implements {AuthProvider<Config>}
 */
export class FacebookAuth {
  /** @satisfies {ENV<Config>} */
  static EnvConfig = /** @type{const} */ ({
    app_id: 'IDP_FACEBOOK_APP_ID',
    app_secret: 'IDP_FACEBOOK_APP_SECRET'
  });

  authorization_url = 'https://www.facebook.com/v22.0/dialog/oauth'
  token_url = 'https://graph.facebook.com/v22.0/oauth/access_token'
  name = 'Facebook'
  logo_url = `data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg" version="1.1" id="svg9" width="666.66669" height="666.66718" viewBox="0 0 666.66668 666.66717"><defs id="defs13"><clipPath clipPathUnits="userSpaceOnUse" id="clipPath25"><path d="M 0,700 H 700 V 0 H 0 Z" id="path23"/></clipPath></defs><g id="g17" transform="matrix(1.3333333,0,0,-1.3333333,-133.33333,799.99999)"><g id="g19"><g id="g21" clip-path="url(#clipPath25)"><g id="g27" transform="translate(600,350)"><path d="m 0,0 c 0,138.071 -111.929,250 -250,250 -138.071,0 -250,-111.929 -250,-250 0,-117.245 80.715,-215.622 189.606,-242.638 v 166.242 h -51.552 V 0 h 51.552 v 32.919 c 0,85.092 38.508,124.532 122.048,124.532 15.838,0 43.167,-3.105 54.347,-6.211 V 81.986 c -5.901,0.621 -16.149,0.932 -28.882,0.932 -40.993,0 -56.832,-15.528 -56.832,-55.9 V 0 h 81.659 l -14.028,-76.396 h -67.631 V -248.169 C -95.927,-233.218 0,-127.818 0,0" style="fill:#0866ff;fill-opacity:1;fill-rule:nonzero;stroke:none" id="path29"/></g><g id="g31" transform="translate(447.9175,273.6036)"><path d="M 0,0 14.029,76.396 H -67.63 v 27.019 c 0,40.372 15.838,55.899 56.831,55.899 12.733,0 22.981,-0.31 28.882,-0.931 v 69.253 c -11.18,3.106 -38.509,6.212 -54.347,6.212 -83.539,0 -122.048,-39.441 -122.048,-124.533 V 76.396 h -51.552 V 0 h 51.552 v -166.242 c 19.343,-4.798 39.568,-7.362 60.394,-7.362 10.254,0 20.358,0.632 30.288,1.831 L -67.63,0 Z" style="fill:#ffffff;fill-opacity:1;fill-rule:nonzero;stroke:none" id="path33"/></g></g></g></g></svg>`
  description= 'Sign with Facebook account'

  /** @param {Config} [config] */
  constructor(config={}) {
    this.config = config;
  }


  /** @type {AuthProvider["init"]} */
  init = (app) => {
    this.config.app_id ??= app.__show_me_everything.platform.env[FacebookAuth.EnvConfig.app_id];
    this.config.app_secret ??= app.__show_me_everything.platform.env[FacebookAuth.EnvConfig.app_secret];
  }

  /** @type {AuthProvider<Config>["generateAuthUri"]} */
  generateAuthUri = async (redirect_uri='', extra=undefined) => {
    const params = new URLSearchParams(
      {
        client_id: this.config.app_id,
        redirect_uri,
        access_type: 'offline',
        response_type: 'code',
        scope: [
          'email',
          'public_profile',
        ].join(', ')
      }
    ).toString();
    return `${this.authorization_url}?${params}`;
  }
      
  /** @type {AuthProvider<Config>["signWithAuthorizationResponse"]} */
  async signWithAuthorizationResponse(params) {
    assert(
      params?.authorization_response?.code,
      `sign_with_authorization_response:: No \`code\` property found for provider ${this.name}`
    )
    const data = {
      ...params.authorization_response,
      code: params.authorization_response.code,
      client_id: this.config.app_id,
      client_secret: this.config.app_secret,
      redirect_uri: params.redirect_uri,
    };

    // console.log({data});

    // exchange authorization code for access token & id_token
    const search_params = new URLSearchParams(data).toString();
    const response = await fetch(
      this.token_url + `?` + search_params, {
      method: 'get',
    });

    /** @type {{id_token: string, access_token: string, token_type: string, expires_in: number}} */
    const json = await response.json();
    // console.log('sign_with_authorization_response:: ', json)

    assert(
      response.ok,
      json
    );

    { 
      // console.log({json})

      const { claims } = parse_jwt(json.id_token);
      const cast_claims = /** @type {JWTClaims & {  email:? string, given_name?: string, family_name?: string, picture?: string }} */ (
        claims
      );

      return {
        email: cast_claims.email,
        firstname: cast_claims.given_name,
        lastname: cast_claims.family_name,
        picture: cast_claims.picture,
      }
    }
  }
}