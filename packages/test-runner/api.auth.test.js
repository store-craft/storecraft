import 'dotenv/config';
import { auth } from '@storecraft/core/v-api';
import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { admin_email, admin_password, create_app } from './utils.js';


const app = await create_app();

test.before(async () => { assert.ok(app.ready) });
test.after(async () => { await app.db.disconnect() });

test('remove and signup admin', async () => {
  await auth.removeByEmail(app, admin_email);
  const r = await auth.signup(app, {
    email: admin_email,
    password: admin_password
  });

  const has_admin_role = r.access_token.claims?.roles?.includes('admin')
  const ok = r.access_token && r.refresh_token && r.user_id && has_admin_role; 
  assert.ok(ok, 'nope');
});


test('signin admin', async () => {
  const r = await auth.signin(app, {
    email: admin_email,
    password: admin_password
  });

  const has_admin_role = r.access_token.claims?.roles?.includes('admin')
  const ok = r.access_token && r.refresh_token && r.user_id && has_admin_role; 
  assert.ok(ok, 'nope');
});

test('refresh admin', async () => {

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


test.run();
