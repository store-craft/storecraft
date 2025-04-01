/**
 * @import { JWTClaims } from '../../api/types.api.js'
 * @import { ApiRequest } from '../../rest/types.public.js'
 */

import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { file_name } from '../api/api.utils.crud.js';
import { App } from '../../index.js';
import { assert_async_throws, assert_partial_v2 } from '../api/utils.js';
import { 
  authorize_by_roles, parse_auth_user, parse_bearer_auth 
} from '../../rest/con.auth.middle.js';
import { 
  email_password_to_basic, parse_api_key 
} from '../../api/con.auth.logic.js';
import { jwt } from '../../crypto/public.js';


/**
 * @param {App} app `storecraft` app instance
 */
export const create = app => {

  const s = suite(
    file_name(import.meta.url), 
    {}
  );

  const credentials = {
    email: 'tester@example.com',
    password: 'tester',
    firstname: 'John',
    lastname: 'Doe',
  }

  s.before(
    async () => { 
      await app.init();
      assert.ok(app.ready);
    }
  );

  s('parse_auth_user with empty things', async (ctx) => {
    { // middleware with garbage JWT token
      /** @type {Partial<ApiRequest>} */
      const request = {
        headers: new Headers(
          {
            'Authorization': `Bearer wrong-token`
          }
        ),
      }

      await parse_bearer_auth(app)(
        request
      );

      assert.not(request.user, 'req.user should be undefined')
    }

    { // middleware with undefined JWT token
      /** @type {Partial<ApiRequest>} */
      const request = {
        headers: new Headers(
          {
            'Authorization': undefined
          }
        ),
      }

      await parse_bearer_auth(app)(
        request
      );

      assert.not(request.user, 'req.user should be undefined')
    }

    { // middleware with garbage Basic token
      /** @type {Partial<ApiRequest>} */
      const request = {
        headers: new Headers(
          {
            'Authorization': `Basic base64-encoded-string`
          }
        ),
      }

      await parse_bearer_auth(app)(
        request
      );

      assert.not(request.user, 'req.user should be undefined')
    }

    { // middleware with undefined Basic token
      /** @type {Partial<ApiRequest>} */
      const request = {
        headers: new Headers(
          {
            'Authorization': undefined
          }
        ),
      }

      await parse_bearer_auth(app)(
        request
      );

      assert.not(request.user, 'req.user should be undefined')
    }

    { // middleware with garbage api key
      /** @type {Partial<ApiRequest>} */
      const request = {
        headers: new Headers(
          {
            'X-API-KEY': `wrong-api-key`
          }
        ),
      }

      await parse_bearer_auth(app)(
        request
      );

      assert.not(request.user, 'req.user should be undefined')
    }

    { // middleware with undefined api key
      /** @type {Partial<ApiRequest>} */
      const request = {
        headers: new Headers(
          {
            'X-API-KEY': undefined
          }
        ),
      }

      await parse_bearer_auth(app)(
        request
      );

      assert.not(request.user, 'req.user should be undefined')
    }

    { // middleware without token
      /** @type {Partial<ApiRequest>} */
      const request = {
      }

      await parse_bearer_auth(app)(
        request
      );

      assert.not(request.user, 'req.user should be undefined')
    }
  });  

  s('parse_auth_user with JWT access token', async (ctx) => {
    const api_auth_result = await app.api.auth.signup(
      {
        email: credentials.email,
        password: credentials.password,
        firstname: credentials.firstname,
        lastname: credentials.lastname,
      }
    );

    /** @type {Partial<ApiRequest>} */
    const request = {
      headers: new Headers(
        {
          'Authorization': `Bearer ${api_auth_result.access_token.token}`
        }
      ),
    }

    await parse_bearer_auth(app)(
      request
    );

    assert_partial_v2(
      request.user,
      {
        email: api_auth_result.access_token.claims.email,
        sub: api_auth_result.access_token.claims.sub,
        firstname: api_auth_result.access_token.claims.firstname,
        lastname: api_auth_result.access_token.claims.lastname,
        roles: api_auth_result.access_token.claims.roles
      },
      'req.user claims should be equal to the access_token claims'
    )

  });  

  s('parse_auth_user with basic auth', async (ctx) => {

    const api_auth_result = await app.api.auth.signin(
      {
        email: credentials.email,
        password: credentials.password,
      }
    );

    const basic = email_password_to_basic(
      credentials.email,
      credentials.password
    );

    /** @type {Partial<ApiRequest>} */
    const request = {
      headers: new Headers(
        {
          'Authorization': `Basic ${basic}`
        }
      ),
    }

    await parse_auth_user(app)(
      request
    );

    assert_partial_v2(
      request.user,
      {
        email: api_auth_result.access_token.claims.email,
        sub: api_auth_result.access_token.claims.sub,
        firstname: api_auth_result.access_token.claims.firstname,
        lastname: api_auth_result.access_token.claims.lastname,
        roles: api_auth_result.access_token.claims.roles
      },
      'req.user claims should be equal to the access_token claims'
    )
  });  

  s('parse_auth_user with api key', async (ctx) => {

    const api_auth_result = await app.api.auth.create_api_key();
    const auth_user = await app.api.auth.get_auth_user(
      parse_api_key(api_auth_result).email
    );

    /** @type {Partial<ApiRequest>} */
    const request = {
      headers: new Headers(
        {
          'X-API-KEY': `${api_auth_result.apikey}`
        }
      ),
    }

    await parse_auth_user(app)(
      request
    );

    assert.ok(
      request.user,
      'req.user should be defined'
    )

    // console.log({auth_user, user: request.user});

    assert_partial_v2(
      request.user,
      {
        email: auth_user.email,
        sub: auth_user.id,
        firstname: undefined,
        lastname: undefined,
        roles: auth_user.roles
      },
      'req.user claims should be equal to the auth user claims'
    )
  });  

  s('authorize_by_roles', async (ctx) => {
    /** 
     * @type {Partial<JWTClaims>} 
     */
    const claims = {
      roles: ['admin'],
    }

    const access_token = await jwt.create(
      app.config.auth_secret_access_token, 
      claims, jwt.JWT_TIMES.HOUR
    );

    /** @type {Partial<ApiRequest>} */
    const request = {
      headers: new Headers(
        {
          'Authorization': `Bearer ${access_token.token}`
        }
      ),
    }

    // this should not throw
    await authorize_by_roles(
      app, ['admin']
    )(
      request
    );

    assert.ok(
      request.user,
      'req.user should be defined'
    );

    { // now let's try with a role that does not exist

      assert_async_throws(
        () => authorize_by_roles(app, ['not-admin'])(
          request
        )
      );
  
    }

  });  

  return s;
}

