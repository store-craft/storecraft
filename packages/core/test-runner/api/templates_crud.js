/**
 * @import { TemplateType, TemplateTypeUpsert } from '../../api/types.api.js'
 * @import { CrudTestContext } from './api.utils.types.js';
 * @import { Test } from 'uvu';
 */
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { 
  create_handle, file_name 
} from './api.utils.js';
import { App } from '../../index.js';
import { encode } from '../../crypto/base64.js';
import esMain from './utils.esmain.js';
import { add_sanity_crud_to_test_suite } from './api.crud.js';

const handle_tag = create_handle('template', file_name(import.meta.url));

/** @type {TemplateTypeUpsert[]} */
const items_upsert = [
  {
    handle: handle_tag(),
    title: 'template 1',
    reference_example_input: { key: 'value' },
    template_html: '<html><body>Hello</body></html>',
    template_text: 'Hello',
    template_subject: 'Subject',
  },
  {
    handle: handle_tag(),
    title: 'template 2',
    reference_example_input: { key: 'value' },
    template_html: '<html><body>Hello</body></html>',
    template_text: 'Hello',
    template_subject: 'Subject',
  },
  {
    handle: handle_tag(),
    title: 'template 3',
    reference_example_input: { key: 'value' },
    template_html: '<html><body>Hello</body></html>',
    template_text: 'Hello',
    template_subject: 'Subject',
  },
]

/**
 * 
 * @param {App} app 
 */
export const create = app => {

  /** @type {Test<CrudTestContext<TemplateType>>} */
  const s = suite(
    file_name(import.meta.url), 
    { 
      items: items_upsert, 
      app, 
      ops: app.api.templates,
      events: {
        get_event: 'templates/get',
        upsert_event: 'templates/upsert',
        remove_event: 'templates/remove',
      }
    }
  );

  s.before(
    async () => { 
      assert.ok(app.isready) 
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

  s('test that driver respects base64 encoding', async (ctx) => {
    const handle = handle_tag();
    await app.api.templates.upsert(
      {
        handle: handle,
        title: 'template 3',
        reference_example_input: { key: 'value' },
        template_html: 'base64_' + encode('html'),
        template_text: 'base64_' + encode('text'),
        template_subject: 'base64_' + encode('subject'),
      }
    );

    const template = await app.api.templates.get(handle);

    assert.equal(template.template_html, 'html');
    assert.equal(template.template_text, 'text');
    assert.equal(template.template_subject, 'subject');
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
    s.after(async () => { await app.__show_me_everything.db.disconnect() });
    s.run();
  } catch (e) {
  }
})();
