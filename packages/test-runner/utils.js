import { App } from '@storecraft/core';
import { MongoDB } from '@storecraft/database-mongodb-node';
import { NodePlatform } from '@storecraft/platform-node';
import * as assert from 'uvu/assert';

const filter_actual_keys_by_expected = (actual, expected) => {
  return Object.keys(expected).reduce(
    (p, c) => {
      p[c] = actual[c];
      return p;
    }, {}
  )
}

export const assert_partial = (actual, expected) => {
  assert.equal(filter_actual_keys_by_expected(actual, expected), expected);
}

export const assert_async_throws = async (fn) => {
  try {
    await fn();
  } catch (e) {
    console.log('throwing function ', e.message)
    return;
  }

  assert.ok(false, 'function should have thrown !!!')
}

export const admin_email = 'admin@sc.com';
export const admin_password = 'password';

export const create_app = async () => {
  let app = new App(
    new NodePlatform(),
    new MongoDB({ db_name: 'test'}),
    null, null, null, {
      admins_emails: [admin_email],
    }
  );
  
  return app.init();
}
