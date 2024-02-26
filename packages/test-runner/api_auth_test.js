import 'dotenv/config';
import { auth } from '@storecraft/core/v-api';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { file_name } from './api.utils.crud.js';
import { App } from '@storecraft/core';
import esMain from './utils.esmain.js';


export const admin_email = 'admin@sc.com';
export const admin_password = 'password';

/**
 * 
 * @param {App} app 
 */
export const create = app => {
  // const app = await create_app();
  const s = suite(
    file_name(import.meta.url), 
  );
  
  s.before(async () => { assert.ok(app.ready) });
  s.after(async () => { await app.db.disconnect() });
  
  s('remove and signup admin', async () => {
    await auth.removeByEmail(app, admin_email);
    const r = await auth.signup(app, {
      email: admin_email,
      password: admin_password
    });
  
    const has_admin_role = r.access_token.claims?.roles?.includes('admin')
    const ok = r.access_token && r.refresh_token && r.user_id && has_admin_role; 
    assert.ok(ok, 'nope');
  });
  
  
  s('signin admin', async () => {
    const r = await auth.signin(app, {
      email: admin_email,
      password: admin_password
    });
  
    const has_admin_role = r.access_token.claims?.roles?.includes('admin')
    const ok = r.access_token && r.refresh_token && r.user_id && has_admin_role; 
    assert.ok(ok, 'nope');
  });
  
  s('refresh admin', async () => {
  
    const u = await auth.signin(app, {
      email: admin_email,
      password: admin_password
    });
    const r = await auth.refresh(app, {
      refresh_token: u.refresh_token.token
    });
  
    const has_admin_role = r.access_token.claims?.roles?.includes('admin')
    const ok = r.access_token && r.refresh_token && r.user_id && has_admin_role; 
    assert.ok(ok, 'nope');
  });
  
  return s;
}


(async function inner_test() {
  // helpful for direct inner tests
  if(!esMain(import.meta)) return;
  try {
    const { create_app } = await import('./play.js');
    const app = await create_app();
    create(app).run();
  } catch (e) {
  }
})();
