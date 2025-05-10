/**
 * @import { 
 * } from './types.private.js';
 * @import { Config } from './types.public.js';
 * @import { AuthProvider, OAuthProviderUser } from '../../types.js';
 * @import { ENV } from '../../../types.public.js';
 * @import { JWTClaims } from '../../../crypto/jwt.js';
 */
import { assert } from '../../../api/utils.func.js'


/**
 * @description Dummy Auth Provider for testing purposes.
 * Generates random and fake user data. Mainly used to test `auth`
 * events.
 * @implements {AuthProvider<Config>}
 */
export class DummyAuth {
  /** @satisfies {ENV<Config>} */
  static EnvConfig = /** @type{const} */ ({
    app_id: 'IDP_DUMMY_APP_ID',
    app_secret: 'IDP_DUMMY_APP_SECRET'
  });

  authorization_url = 'https://auth.dummy.com/oauth/authorize'
  name = 'Dummy Auth Provider'
  logo_url = `data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg" version="1.1" id="svg9" width="666.66669" height="666.66718" viewBox="0 0 666.66668 666.66717"><defs id="defs13"><clipPath clipPathUnits="userSpaceOnUse" id="clipPath25"><path d="M 0,700 H 700 V 0 H 0 Z" id="path23"/></clipPath></defs><g id="g17" transform="matrix(1.3333333,0,0,-1.3333333,-133.33333,799.99999)"><g id="g19"><g id="g21" clip-path="url(#clipPath25)"><g id="g27" transform="translate(600,350)"><path d="m 0,0 c 0,138.071 -111.929,250 -250,250 -138.071,0 -250,-111.929 -250,-250 0,-117.245 80.715,-215.622 189.606,-242.638 v 166.242 h -51.552 V 0 h 51.552 v 32.919 c 0,85.092 38.508,124.532 122.048,124.532 15.838,0 43.167,-3.105 54.347,-6.211 V 81.986 c -5.901,0.621 -16.149,0.932 -28.882,0.932 -40.993,0 -56.832,-15.528 -56.832,-55.9 V 0 h 81.659 l -14.028,-76.396 h -67.631 V -248.169 C -95.927,-233.218 0,-127.818 0,0" style="fill:#0866ff;fill-opacity:1;fill-rule:nonzero;stroke:none" id="path29"/></g><g id="g31" transform="translate(447.9175,273.6036)"><path d="M 0,0 14.029,76.396 H -67.63 v 27.019 c 0,40.372 15.838,55.899 56.831,55.899 12.733,0 22.981,-0.31 28.882,-0.931 v 69.253 c -11.18,3.106 -38.509,6.212 -54.347,6.212 -83.539,0 -122.048,-39.441 -122.048,-124.533 V 76.396 h -51.552 V 0 h 51.552 v -166.242 c 19.343,-4.798 39.568,-7.362 60.394,-7.362 10.254,0 20.358,0.632 30.288,1.831 L -67.63,0 Z" style="fill:#ffffff;fill-opacity:1;fill-rule:nonzero;stroke:none" id="path33"/></g></g></g></g></svg>`
  description= 'Sign with a Dummy Auth provider'
  // cache codes to users for secondary requests
  // this is not a good idea, but for testing purposes
  // this will help with idempotency of signin again a random user
  /** @type {Record<string, OAuthProviderUser>} */
  codes_to_users = {}

  /** @param {Config} [config] */
  constructor(config={}) {
    this.config = config;
  }

  /** @type {AuthProvider["init"]} */
  init = (app) => {
    this.config.app_id ??= app.__show_me_everything.platform.env[DummyAuth.EnvConfig.app_id];
    this.config.app_secret ??= app.__show_me_everything.platform.env[DummyAuth.EnvConfig.app_secret];
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
    const code = params?.authorization_response?.code;
    assert(
      code,
      `sign_with_authorization_response:: No \`code\` property found for provider ${this.name}`
    )

    // when invoked second time with the same code
    // return the same user, this will help with idempotency
    // and testing that the second invokation is the same
    // as the first one, therefore we can model a signin
    if(!this.codes_to_users[code]) {
      // generate a new user
      const now = Date.now();
      this.codes_to_users[code] = {
        email: `fake-user-${now}@dummy.com`,
        firstname: `fake-firstname-${now}`,
        lastname: `fake-lastname-${now}`,
        picture: `https://dummyimage.com/100x100/000/fff&text=${now}`,
      }
    }

    return this.codes_to_users[code];
  }
}