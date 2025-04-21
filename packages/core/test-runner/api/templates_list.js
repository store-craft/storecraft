/**
 * @import { TemplateType, TemplateTypeUpsert } from '../../api/types.api.js'
 * @import { QueryTestContext } from './api.utils.types.js';
 * @import { Test } from 'uvu';
 */
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { create_handle, file_name, 
  iso, add_query_list_integrity_tests,
  get_static_ids} from './api.utils.crud.js';
import { App } from '../../index.js';
import esMain from './utils.esmain.js';

const handle_tag = create_handle('template', file_name(import.meta.url));

// In this test, we will test the query list function.
// In order to create syntatic data with controlled dates,
// we will write straight to the databse, bypassing the
// virtual api of storecraft for insertion

/** 
 * @type {TemplateTypeUpsert[]} 
 */
const items = get_static_ids('template').map(
  (id, ix, arr) => {
    // 5 last items will have the same timestamps
    const jx = Math.min(ix, arr.length - 3);
    return {
      handle: handle_tag(),
      title: 'template list test ' + ix,
      reference_example_input: { key: 'value' },
      template_html: '<html><body>Hello</body></html>',
      template_text: 'Hello',  
      id,
      created_at: iso(jx + 1),
    }
  }
);


/**
 * 
 * @param {App} app 
 */
export const create = app => {

  /** @type {Test<QueryTestContext<TemplateType, TemplateTypeUpsert>>} */
  const s = suite(
    file_name(import.meta.url), 
    { 
      items: items, 
      app, 
      ops: app.api.templates,
      resource: 'templates', 
      events: { list_event: 'templates/list' }
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

