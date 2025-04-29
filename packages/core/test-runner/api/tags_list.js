/**
 * @import { TagType, TagTypeUpsert } from '../../api/types.api.js'
 * @import { QueryTestContext } from './api.utils.types.js';
 * @import { Test } from 'uvu';
 */
import { suite } from 'uvu';
import { 
  create_handle, file_name, 
  iso, get_static_ids
} from './api.utils.js';
import { App } from '../../index.js';
import esMain from './utils.esmain.js';
import { add_query_list_integrity_tests } from './api.crud.js';

const handle_tag = create_handle('tag', file_name(import.meta.url));

// In this test, we will test the query list function.
// In order to create syntatic data with controlled dates,
// we will write straight to the databse, bypassing the
// virtual api of storecraft for insertion

/** 
 * @type {TagTypeUpsert[]} 
 */
const items = get_static_ids('tag').map(
  (id, ix, arr) => {
    // 5 last items will have the same timestamps
    ix = Math.min(ix, arr.length - 3);
    return {
      handle: handle_tag(),
      values: ['a'],
      id,
      created_at: iso(ix + 1),
    }
  }
);


/**
 * 
 * @param {App} app 
 */
export const create = app => {

  /** @type {Test<QueryTestContext<TagType, TagTypeUpsert>>} */
  const s = suite(
    file_name(import.meta.url), 
    { 
      items: items, 
      app, 
      ops: app.api.tags,
      resource: 'tags', 
      events: { list_event: 'tags/list' }
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
    s.after(async () => { await app.db.disconnect() });
    s.run();
  } catch (e) {
  }
})();

