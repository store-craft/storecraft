import { notifications } from '@storecraft/core/v-api';
import 'dotenv/config';
import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { create_app } from './utils.js';

const app = await create_app();

/** @type {import('@storecraft/core').NotificationTypeUpsert[]} */
const items_upsert = [
  {
    message: 'message 1', search: ['checkout', 'backend'],
    author: 'backend-bot', 
    actions: [
      {
        type: 'url',
        name: 'name',
        params: {
          url: 'https://storecraft.com'
        }
      }
    ]
  },
]

test.before(async () => { assert.ok(app.ready) });
test.after(async () => { await app.db.disconnect() });
const ops = notifications;

test('add', async () => {
  const one = items_upsert[0];
  const ids = await ops.addBulk(
    app, Array.from({ length: 10 }).map((_, ix) => ({...one, message: `message ${ix}`}))
  );

  assert.ok(ids?.length)
});


test.run();
