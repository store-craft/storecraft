/**
 * @import { ExtensionItemGet } from '../../api/types.api.js';
 * @import { extension } from '../../extensions/types.public.js';
 */

import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { file_name } from './api.utils.crud.js';
import esMain from './utils.esmain.js';
import { App } from '../../index.js';
import { assert_async_throws } from './utils.js';
import { DummyExtension } from '../../extensions/dummy/index.js';

/**
 * @param {App} app 
 */
export const create = (app) => {
  const dummy = new DummyExtension();

  const create_aug_app = () => {
    return app.withExtensions(
      {
        dummy
      }
    );
  }

  /** @type {ReturnType<typeof create_aug_app>} */
  let app2;

  const s = suite(
    file_name(import.meta.url), 
    {}
  );

  s.before(
    async () => { 
      assert.ok(app.ready);
      app2 = create_aug_app();
    }
  );

  s.after(
    async () => { 
      assert.ok(app.ready);
    }
  );

  /**
   * 
   * @param {ExtensionItemGet} item_get 
   * @param {string} real_handle 
   * @param {extension} real_ext 
   */
  const test_gw_integrity = (item_get, real_handle, real_ext) => {
    assert.equal(item_get.config, real_ext.config, 'config is not same');
    assert.equal(item_get.actions, real_ext.actions, 'actions is not same');
    assert.equal(item_get.handle, real_handle, 'handle is not same');
    assert.equal(item_get.info, real_ext.info, 'info is not same');
  }

  s('get', async (ctx) => {
    const item_get = await app2.api.extensions.get('dummy');
    test_gw_integrity(item_get, 'dummy', dummy);
  });

  s('list_all', async (ctx) => {
    const list_items = await app2.api.extensions.list_all();
    const item = list_items.find(
      (item) => item.handle === 'dummy'
    );

    assert.ok(item, 'dummy extension not found in list');
    test_gw_integrity(item, 'dummy', dummy);
  });

  s('invoke_action with legit order', async (ctx) => {

    const payload = Date.now();
    const result = await app2.api.extensions.invoke_action(
      'dummy',
      'echo',
      payload
    );

    assert.equal(
      result,
      payload,
      'echo action did not return the same payload'
    );

    { // test with non action
      await assert_async_throws(
        async () => {
          await app2.api.extensions.invoke_action(
            'i-dont-exist',
            'ping'
          );
        },
        'invoke action with non order should throw error'
      )
    }
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
    s.after(async () => { await app.db.disconnect() });
    s.run();
  } catch (e) {
  }
})();
