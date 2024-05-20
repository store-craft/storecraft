import 'dotenv/config';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { add_sanity_crud_to_test_suite, 
  create_handle, file_name } from './api.utils.crud.js';
import { App } from '@storecraft/core';
import esMain from './utils.esmain.js';

const handle_tag = create_handle('template', file_name(import.meta.url));

/** @type {import('@storecraft/core/v-api').TemplateTypeUpsert[]} */
const items_upsert = [
  {
    handle: handle_tag(),
    title: 'template 1',
    reference_example_input: { key: 'value' },
    template_html: '<html><body>Hello</body></html>',
    template_text: 'Hello'
  },
  {
    handle: handle_tag(),
    title: 'template 2',
    reference_example_input: { key: 'value' },
    template_html: '<html><body>Hello</body></html>',
    template_text: 'Hello'
  },
  {
    handle: handle_tag(),
    title: 'template 3',
    reference_example_input: { key: 'value' },
    template_html: '<html><body>Hello</body></html>',
    template_text: 'Hello'
  },
]

/**
 * 
 * @param {App} app 
 */
export const create = app => {

  const s = suite(
    file_name(import.meta.url), 
    { items: items_upsert, app, ops: app.api.templates }
  );

  s.before(
    async () => { 
      assert.ok(app.ready) 
      try {
        for(const p of items_upsert)
          await app.api.templates.remove(p.handle);
      } catch(e) {
        // console.log(e)
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
    const { create_app } = await import('./play.js');
    const app = await create_app();
    const s = create(app);
    s.after(async () => { await app.db.disconnect() });
    s.run();
  } catch (e) {
  }
})();
