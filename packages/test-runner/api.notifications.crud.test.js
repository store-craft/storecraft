import { notifications } from '@storecraft/core/v-api';
import 'dotenv/config';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { create_app } from './utils.js';
import { file_name } from './api.utils.crud.js';

const app = await create_app();
const s = suite(
  file_name(import.meta.url), 
);

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

s.before(async () => { assert.ok(app.ready) });
s.after(async () => { await app.db.disconnect() });
const ops = notifications;

s('add', async () => {
  const one = items_upsert[0];
  const ids = await ops.addBulk(
    app, Array.from({ length: 10 }).map((_, ix) => ({...one, message: `message ${ix}`}))
  );

  assert.ok(ids?.length)
});


s.run();
