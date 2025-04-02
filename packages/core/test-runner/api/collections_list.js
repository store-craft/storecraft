/**
 * @import { CollectionType, CollectionTypeUpsert } from '../../api/types.api.js'
 * @import { Test } from 'uvu';
 * @import { QueryTestContext } from './api.utils.types.js';
 */

import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { create_handle, file_name, 
  iso, add_query_list_integrity_tests,
  get_static_ids} from './api.utils.crud.js';
import { App } from '../../index.js';
import esMain from './utils.esmain.js';

const handle = create_handle('col', file_name(import.meta.url));

// In this test, we will test the query list function.
// In order to create syntatic data with controlled dates,
// we will write straight to the databse, bypassing the
// virtual api of storecraft for insertion

/** 
 * @type {CollectionTypeUpsert[]} 
 */
const items = get_static_ids('col').map(
  (id, ix, arr) => {
    // 5 last items will have the same timestamps
    let jx = Math.min(ix, arr.length - 3);
    return {
      handle: handle(),
      id,
      title: `collection ${ix}`,
      active: true,
      tags: [`a_${ix}`, `b_${ix}`],
      created_at: iso(jx + 1),
    }
  }
);


/**
 * 
 * @param {App} app 
 */
export const create = app => {

  /** @type {Test<QueryTestContext<CollectionType, CollectionTypeUpsert>>} */
  const s = suite(
    file_name(import.meta.url), 
    { 
      items: items, 
      app, 
      ops: app.api.collections,
      resource: 'collections', 
      events: { 
        list_event: 'collections/list' 
      }
    }
  );

  add_query_list_integrity_tests(s);

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

