/**
 * @import { PostType, PostTypeUpsert } from '../../api/types.api.js'
 * @import { QueryTestContext } from './api.utils.types.js';
 * @import { Test } from 'uvu';
 */
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { 
  create_handle, file_name, 
  iso, get_static_ids
} from './api.utils.js';
import { App } from '../../index.js';
import esMain from './utils.esmain.js';
import { add_query_list_integrity_tests } from './api.crud.js';

const handle = create_handle('post', file_name(import.meta.url));

/** 
 * @type {PostTypeUpsert[]} 
 */
const items = get_static_ids('post').map(
  (id, ix, arr) => {
    // 5 last items will have the same timestamps
    let jx = Math.min(ix, arr.length - 3);
    return {
      title: `post ${ix}`, 
      text: `text ${ix}`,
      handle: handle(),
      id,
      created_at: iso(jx + 1),
    }
  }
);


/**
 * @param {App} app 
 */
export const create = app => {

  /** @type {Test<QueryTestContext<PostType, PostTypeUpsert>>} */
  const s = suite(
    file_name(import.meta.url), 
    { 
      items: items, 
      app, 
      ops: app.api.posts,
      resource: 'posts', 
      events: { list_event: 'posts/list' }
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
    console.log(e);
  }
})();

