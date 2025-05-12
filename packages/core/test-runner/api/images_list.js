/**
 * @import { ImageType, ImageTypeUpsert } from '../../api/types.api.js'
 * @import { QueryTestContext } from './api.utils.types.js';
 * @import { Test } from 'uvu';
 */
import { suite } from 'uvu';
import { 
  file_name, iso, get_static_ids
} from './api.utils.js';
import { 
  image_url_to_handle, image_url_to_name 
} from '../../api/con.images.logic.js';
import { App } from '../../index.js';
import esMain from './utils.esmain.js';
import { add_query_list_integrity_tests } from './api.crud.js';

/**
 * @param  {...string} prefixs 
 */
export const image_mock_url_handle_name = (...prefixs) => {
  let index = 0;
  
  return () => {
    const url = [...prefixs, index+=1].join('-') + '.png';
    return {
      url: url,
      name: image_url_to_name(url),
      handle: image_url_to_handle(url)
    }
  }
}


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
    const { create_app } = await import('../../app.test.fixture.js');
    const app = await create_app(false);
    const s = create(app);
    s.after(async () => { await app.__show_me_everything.db.disconnect() });
    s.run();
  } catch (e) {
  }
})();

