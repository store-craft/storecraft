import { notifications } from '@storecraft/core/v-api';
import 'dotenv/config';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { file_name, get_static_ids } from './api.utils.crud.js';
import { App } from '@storecraft/core';
import esMain from './utils.esmain.js';

// const app = await create_app();

/** @type {import('@storecraft/core/v-api').NotificationTypeUpsert[]} */
const items_upsert = get_static_ids('not').map(
  (id, ix, arr) => (
    {
      message: `message ${ix}`, search: ['checkout', 'backend'],
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
    }
  )
);

/**
 * 
 * @param {App} app 
 */
export const create = app => {
  const s = suite(
    file_name(import.meta.url), 
  );
  
  s.before(async () => { assert.ok(app.ready) });
  const ops = notifications;

  s('add', async () => {
    const one = items_upsert[0];
    const ids = await ops.addBulk(
      app, items_upsert
    );

    assert.ok(ids?.length)
  });

  return s;
}


(async function inner_test() {
  // helpful for direct inner tests
  if(!esMain(import.meta)) return;
  try {
    const { create_app } = await import('./play.js');
    const app = await create_app();
    const s = create(app);
    s.after(async () => { await app.db.disconnect() });
    s.run();
  } catch (e) {
  }
})();
