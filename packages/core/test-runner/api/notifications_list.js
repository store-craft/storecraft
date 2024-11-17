/**
 * @import { NotificationType, NotificationTypeUpsert } from '../../api/types.api.js'
 * @import { idable_concrete } from '../../database/types.public.js'
 * @import { ApiQuery } from '../../api/types.api.query.js'
 * @import { PubSubEvent } from '../../pubsub/types.public.js'
 * 
 */
import 'dotenv/config';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { file_name, 
  iso, add_list_integrity_tests,
  get_static_ids} from './api.utils.crud.js';
import { App } from '../../index.js';
import esMain from './utils.esmain.js';

// In this test, we will test the query list function.
// In order to create syntatic data with controlled dates,
// we will write straight to the databse, bypassing the
// virtual api of storecraft for insertion

/** 
 * @type {(NotificationType & idable_concrete)[]} 
 */
const items = get_static_ids('not').map(
  (id, ix, arr) => {
    // 5 last items will have the same timestamps
    let jx = Math.min(ix, arr.length - 3);
    return {
      id,
      created_at: iso(jx + 1),
      updated_at: iso(jx + 1),
      message: `message ${ix}`, 
      search: ['checkout', 'backend'],
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
  }
);


/**
 * 
 * @param {App} app 
 */
export const create = app => {

  const s = suite(
    file_name(import.meta.url), 
    { 
      items: items, app, ops: app.api.notifications,
      resource: 'notifications'
    }
  );

  s.before(
    async (a) => { 
      assert.ok(app.ready) 
      try {
        for(const p of items) {
          await app.api.notifications.remove(p.id);
          // we bypass the api and upsert straight
          // to the db because we control the time-stamps
          await app.db.resources.notifications.upsert(p);
        }
      } catch(e) {
        console.log(e)
        throw e;
      }
    }
  );

  // @ts-ignore
  add_list_integrity_tests(s);

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

