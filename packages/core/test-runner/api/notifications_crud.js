/**
 * @import { NotificationTypeUpsert } from '../../api/types.api.js'
 */
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { file_name, get_static_ids } from './api.utils.js';
import { App } from '../../index.js';
import esMain from './utils.esmain.js';

// const app = await create_app();

/** @type {NotificationTypeUpsert[]} */
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
  
  s.before(async () => { assert.ok(app.isready) });
  const ops = app.api.notifications;

  s('add', async () => {
    const one = items_upsert[0];
    const ids = await ops.addBulk(
      items_upsert
    );

    assert.ok(ids?.length)
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
    s.after(async () => { await app.__show_me_everything.db.disconnect() });
    s.run();
  } catch (e) {
  }
})();
