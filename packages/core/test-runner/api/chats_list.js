/**
 * @import { ChatType, ChatTypeUpsert } from '../../api/types.api.js'
 * @import { QueryTestContext } from './api.utils.types.js';
 * @import { Test } from 'uvu';
 */
import { suite } from 'uvu';
import { 
  file_name, 
  iso, get_static_ids
} from './api.utils.js';
import { App } from '../../index.js';
import esMain from './utils.esmain.js';
import { add_query_list_integrity_tests } from './api.crud.js';
import { ID } from '../../api/utils.func.js';

/** 
 * @type {ChatTypeUpsert[]} 
 */
const items = 
[
  ...get_static_ids('chat').slice(1).map(
    (id, ix, arr) => {
      // 3 last items will have the same `created_at` timestamps
      // last id will be smaller than the rest
      let jx = Math.min(ix, arr.length - 3);
      return /** @type {ChatTypeUpsert} */({
        id,
        created_at: iso(jx),
        customer_email: 'a1@a.com',
        customer_id: ID('cus'),
        extra: { a1: 1 },
      })
    }
  ),
  {
    id: get_static_ids('chat')[0],
    created_at: iso(10),
    customer_email: 'a1@a.com',
    customer_id: ID('cus'),
    extra: { a1: 1 },
  }
]


/**
 * @param {App} app 
 */
export const create = app => {

  /** @type {Test<QueryTestContext<ChatType, ChatTypeUpsert>>} */
  const s = suite(
    file_name(import.meta.url), 
    { 
      items: items, 
      app, 
      ops: app.api.chats,
      resource: 'chats', 
      events: { list_event: 'chats/list' }
    }
  );

  add_query_list_integrity_tests(s);

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
    console.log(e);
  }
})();

