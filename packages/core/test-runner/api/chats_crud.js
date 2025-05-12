/**
 * @import { ChatType, ChatTypeUpsert } from '../../api/types.api.js'
 * @import { CrudTestContext } from './api.utils.types.js';
 * @import { Test } from 'uvu';
 */
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { create_handle, file_name } from './api.utils.js';
import { App } from '../../index.js';
import esMain from './utils.esmain.js';
import { add_sanity_crud_to_test_suite } from './api.crud.js';
import { ID } from '../../api/utils.func.js';

// const handle = create_handle('post', file_name(import.meta.url));

/** @type {ChatTypeUpsert[]} */
const items_upsert = [
  {
    id: ID('chat') ,customer_email: 'a1@a.com', extra: { a1: 1 },
  },
  {
    id: ID('chat'), customer_email: 'a2@a.com', extra: { a2: 1 },
  },
  {
    id: ID('chat'), customer_email: 'a3@a.com', extra: { a3: 1 },
  },
]


/**
 * 
 * @param {App} app 
 */
export const create = app => {

  /** @type {Test<CrudTestContext<ChatType>>} */
  const s = suite(
    file_name(import.meta.url), 
    { 
      items: items_upsert, app, ops: app.api.chats,
      events: {
        get_event: 'chats/get',
        upsert_event: 'chats/upsert',
        remove_event: 'chats/remove',
      }
    }
  );

  
  s.before(
    async () => { 
      assert.ok(app.isready) 
      try {
        for(const p of items_upsert)
          await app.api.chats.remove(p.id);
      } catch(e) {
        console.log(e)
        throw e;
      }

    }
  );

  add_sanity_crud_to_test_suite(s);
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
