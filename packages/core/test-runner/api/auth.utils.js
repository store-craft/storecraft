/**
 * @import { events } from '../../pubsub/types.public.js'
 * @import { ApiAuthResult } from '../../api/types.public.js'
 */
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { App } from '../../index.js';
import esMain from './utils.esmain.js';
import { sleep } from './api.utils.js';
import * as jwt from '../../crypto/jwt.js'


export const admin_email = 'admin@sc.com';
export const admin_password = 'password';

/**
 * Verify the auth result
 * @param {App} app 
 * @param {Partial<ApiAuthResult>} auth_result 
 * @param {string} [verify_email] optional email to verify is in the claims
 */
export const verify_api_auth_result = async (app, auth_result, verify_email) => {

  // general verify
  assert.ok(auth_result, 'no auth result');
  assert.ok(auth_result.user_id, 'no user_id in auth result');
  
  { // access token
    assert.ok(auth_result.access_token, 'no access_token in auth result');
    assert.ok(
      auth_result.access_token.claims, 
      'access token claims not found'
    );

    const access_token_verification = await jwt.verify(
      app.config.auth_secret_access_token,
      auth_result.access_token.token,
      true
    );
  
    assert.ok(
      access_token_verification.verified, 
      'access token not verified'
    );
  
    if(verify_email) {
      assert.equal(
        auth_result.access_token.claims.email, 
        verify_email, 
        'verify email not found in access token claims'
      );
    }

  }

  { // refresh token
    assert.ok(auth_result.refresh_token, 'no refresh_token in auth result');
    assert.ok(
      auth_result.refresh_token.claims, 
      'refresh token claims not found'
    );
    
    const refresh_token_verification = await jwt.verify(
      app.config.auth_secret_refresh_token,
      auth_result.refresh_token.token,
      true
    );
  
    assert.ok(
      refresh_token_verification.verified, 
      'refesh token not verified'
    );

    assert.equal(
      auth_result.refresh_token.claims.aud,
      '/refresh',
      'refresh token audience not found' 
    );
  
    if(verify_email) {
      assert.equal(
        auth_result.refresh_token.claims.email, 
        verify_email, 
        'verify email not found in refresh token claims'
      );
    }
  }

}

