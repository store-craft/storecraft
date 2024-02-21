import { App } from '@storecraft/core';
import { auth, products } from '@storecraft/core/v-api';
import { MongoDB } from '@storecraft/database-mongodb-node';
import { NodePlatform } from '@storecraft/platform-node';
import 'dotenv/config';
import { test } from 'uvu';
import * as assert from 'uvu/assert';

const admin_email = 'admin@sc.com';
const admin_password = 'password';
let app = new App(
  new NodePlatform(),
  new MongoDB({ db_name: 'test'}),
  null, null, null, {
    admins_emails: [admin_email],
  }
);

await app.init();

test.before(async () => { assert.ok(app.ready) });

test('upsert product', async () => {
  const id = await products.upsert(app, {
    active: true, handle: 'product-1', price: 50, 
    qty: 1, title: 'product-1 title'
  });

  const ok = id; 
  assert.ok(ok, 'nope');
});

test.run();
