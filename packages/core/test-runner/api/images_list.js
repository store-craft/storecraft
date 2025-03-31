/**
 * @import { ImageType, ImageTypeUpsert } from '../../api/types.api.js'
 * @import { idable_concrete } from '../../database/types.public.js'
 * @import { ApiQuery } from '../../api/types.api.query.js'
 * @import { PubSubEvent } from '../../pubsub/types.public.js'
 * @import { QueryTestContext } from './api.utils.types.js';
 * @import { Test } from 'uvu';
 */
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { file_name, 
  iso, add_query_list_integrity_tests,
  get_static_ids,
  image_mock_url_handle_name} from './api.utils.crud.js';
import { App } from '../../index.js';
import esMain from './utils.esmain.js';

const url_handle_name = image_mock_url_handle_name(
  'img', file_name(import.meta.url)
);

// In this test, we will test the query list function.
// In order to create syntatic data with controlled dates,
// we will write straight to the databse, bypassing the
// virtual api of storecraft for insertion

/** 
 * @type {ImageTypeUpsert[]} 
 */
const items = get_static_ids('img').map(
  (id, ix, arr) => {
    // 5 last items will have the same timestamps
    let jx = Math.min(ix, arr.length - 3);
    return {
      id,
      created_at: iso(jx + 1),
      ...url_handle_name()
    }
  }
);


/**
 * 
 * @param {App} app 
 */
export const create = app => {

  /** @type {Test<QueryTestContext<ImageType, ImageTypeUpsert>>} */
  const s = suite(
    file_name(import.meta.url), 
    { 
      items: items, 
      app, 
      ops: app.api.images,
      resource: 'images', 
      events: { list_event: 'images/list' }
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

