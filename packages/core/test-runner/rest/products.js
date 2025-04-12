/**
 * @import { JWTClaims } from '../../api/types.api.js'
 * @import { ApiRequest } from '../../rest/types.public.js'
 */

import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { file_name } from '../api/api.utils.crud.js';
import { App } from '../../index.js';
import { 
  assert_async_throws, assert_partial_v2, withRandom, withTimestamp 
} from '../api/utils.js';
import { 
  authorize_by_roles, parse_auth_user, parse_bearer_auth 
} from '../../rest/con.auth.middle.js';
import { 
  email_password_to_basic, parse_api_key 
} from '../../api/con.auth.logic.js';
import { jwt } from '../../crypto/public.js';
import esMain from '../api/utils.esmain.js';
import { StorecraftSDK } from '@storecraft/sdk';

/**
 * @param {App} app `storecraft` app instance
 */
const setup_sdk = (app) => {
  
  const sdk = new StorecraftSDK(
    {},
    (input, init) => {
      return app.handler.handler(
        new Request(input, init),
      )
    }
  );

  return sdk;
}

/**
 * @param {App} app `storecraft` app instance
 */
export const create = app => {

  const s = suite(
    file_name(import.meta.url), 
    {}
  );

    // console.log({credentials});

  s.before(
    async () => { 
      await app.init();
      assert.ok(app.ready);
    }
  );

  s('just', async (ctx) => {
  });  

  return s;
}



(async function inner_test() {
  // helpful for direct inner tests
  if(!esMain(import.meta)) return;
  try {
    const { create_app } = await import('../../app.test.fixture.js');
    const app = await create_app(false);
    const s = create(app);
    s.after(async () => { await app.db.disconnect() });
    s.run();
  } catch (e) {
  }
})();