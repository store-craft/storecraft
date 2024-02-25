import 'dotenv/config';
import { auth } from '@storecraft/core/v-api';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { admin_email, admin_password, create_app } from './utils.js';
import { file_name } from './api.utils.crud.js';


const app = await create_app();
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


s.run();
