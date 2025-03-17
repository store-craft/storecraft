/**
 * @import { 
 *  ApiAuthResult,
 *  OAuthProviderCreateURIParams, SignWithOAuthProviderParams, 
 *  OAuthProviderCreateURIResponse
 * } from './types.api.js';
 * @import { JWTClaims } from '../crypto/jwt.js'
 */
import * as jwt from '../crypto/jwt.js'
import { ID, assert } from './utils.func.js'
import { App } from '../index.js'
import { 
  isAdminEmail, sanitize_auth_user, upsert_auth_user 
} from './con.auth.logic.js'

export const ATTRIBUTE_OAUTH_PROVIDER = 'OAUTH_PROVIDER'
export const ATTRIBUTE_PICTURE = 'PICTURE'

/**
 * @param {App} app 
 */  
export const create_auth_uri = (app) => 
  /**
   * @description Get Identity provider's URI for web apps
   * @param {OAuthProviderCreateURIParams} params 
   * @returns {Promise<OAuthProviderCreateURIResponse>}
   */
  async (params) => {

    const provider = app.auth_providers?.[params?.provider];

    assert(
      provider,
      `Identity Provider ${params.provider} not found`
    );

    const uri = await provider.generateAuthUri(
      params.redirect_uri, params.extra_parameters
    );
    // console.log({uri})
    assert(
      uri,
      `Identity Provider ${params.provider} does not have a web consent uri`
    );

    return {
      uri,
      provider: params.provider
    }
  
  }
    
/**
 * @param {App} app 
 */  
export const sign_with_identity_provider = (app) => 
  /**
   * @description Signin / Signup with Identity Provider
   * 
   * @param {SignWithOAuthProviderParams} params 
   * 
   * @returns {Promise<ApiAuthResult>}
   */
  async (params) => {

    const provider = app.auth_providers?.[params?.provider];
    
    assert(
      provider,
      `Identity Provider ${params.provider} not found`
    );

    const response = await provider.signWithAuthorizationResponse(
      {
        redirect_uri: params.redirect_uri,
        authorization_response: params.authorization_response
      }
    );

    // console.log('params', params)
    // console.log('response', response)

    {
      const {
        email, firstname, lastname, picture
      } = response;

      const roles = isAdminEmail(app, email) ? ['admin'] : ['user'];
      let user = await app.api.auth.get_auth_user(email);
      let is_new_user = !Boolean(user)

      // upsert new
      if(is_new_user) {
        user = {
          id: ID('au'),
          email, 
          active: true,
          password: undefined,
          confirmed_mail: true,
          description: `This user is a created with roles: ${roles.join(', ')}`,
          firstname,
          lastname,
          attributes: [
            {
              key: ATTRIBUTE_OAUTH_PROVIDER,
              value: params.provider
            },
            {
              key: ATTRIBUTE_PICTURE,
              value: picture
            },
            {
              key: 'firstname',
              value: firstname?.slice(0, 20)
            },
            {
              key: 'lastname',
              value: lastname?.slice(0, 20)
            },
          ]
        }

        const success = await upsert_auth_user(app)(
          user
        );

        if(success) {
          // optional, but we set up a customer record directly into database
          // to avoid confusions
          await app.api.customers.upsert(
            {
              email: user.email,
              auth_id: user.id,
              id: 'cus_' + user.id.split('_')?.at(-1),
              firstname: firstname,
              lastname: lastname
            }
          );
        }
      }

      // issue tokens

      /** @type {Partial<JWTClaims>} */
      const claims = {
        sub: user.id, 
        // @ts-ignore
        roles,
        firstname: firstname,
        lastname: lastname,
        email: email
      };

      const access_token = await jwt.create(
        app.config.auth_secret_access_token,
        claims, jwt.JWT_TIMES.HOUR
      );

      const refresh_token = await jwt.create(
        app.config.auth_secret_refresh_token, 
        {
          ...claims, 
          aud: '/refresh'
        }, 
        jwt.JWT_TIMES.DAY * 7
      );

      { // dispatch event
        const sanitized = sanitize_auth_user(user);

        if(is_new_user) {
          await app.pubsub.dispatch(
            'auth/signup',
            sanitized
          );
        } else {
          await app.pubsub.dispatch(
            'auth/signin',
            sanitized
          );
        }
      }

      return {
          token_type: 'Bearer',
          user_id: user.id,
          access_token, 
          refresh_token
      }
    }  
  
  }


/**
 * @param {App} app 
*/  
export const identity_providers = (app) => 
  /**
   * @description get identity providers
   */
  () => {
    return Object.entries(app.auth_providers ?? {}).map(
      ([handle, value]) => (
        {
          provider: handle,
          name: value.name,
          logo_url: value.logo_url,
          description: value.description
        }
      )
    )
  };
