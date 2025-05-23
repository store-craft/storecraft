/**
 * @import { ImageType, ImageTypeUpsert } from '../../api/types.api.js'
 * @import { CrudTestContext } from './api.utils.types.js';
 * @import { Test } from 'uvu';
 */
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { file_name } from './api.utils.js';
import { App } from '../../index.js';
import esMain from './utils.esmain.js';
import { add_sanity_crud_to_test_suite } from './api.crud.js';

/** @type {ImageTypeUpsert[]} */
const items_upsert = [
  {
    handle: 'a1-png', name: 'a1.png', url: 'https://host.com/a1.png'
  },
  {
    handle: 'a2-png', name: 'a2.png', url: 'https://host.com/folder/a2.png'
  },
  {
    handle: 'a3-png', name: 'a3.png', url: 'https://host.com/folder/a3.png'
  },
]

/**
 * 
 * @param {App} app 
 */
export const create = app => {

  /** @type {Test<CrudTestContext<ImageType>>} */
  const s = suite(
    file_name(import.meta.url), 
    { 
      items: items_upsert, app, ops: app.api.images,
      events: {
        get_event: 'images/get',
        upsert_event: 'images/upsert',
        remove_event: 'images/remove',
      }
    }
  );

  s.before(
    async () => { 
      assert.ok(app.isready) 
      try {
        for(const p of items_upsert)
          await app.api.images.remove(p.handle);
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
