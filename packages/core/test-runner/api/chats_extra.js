/**
 * @import { ChatType, ChatTypeUpsert } from '../../api/types.api.js'
 * @import { ChatHistoryType } from '../../ai/types.public.js'
 * @import { Test } from 'uvu';
 */
import { suite } from 'uvu';
import { 
  file_name, 
  stream_to_string
} from './api.utils.js';
import { App } from '../../index.js';
import esMain from './utils.esmain.js';
import { ID } from '../../api/utils.func.js';
import * as assert from 'uvu/assert';

/**
 * @param {App} app 
 */
export const create = (app) => {

  const s = suite(
    file_name(import.meta.url), 
  );

  s('upload / download chat', async (ctx) => {

    const id = ID('chat');
    const chat = /** @type {ChatHistoryType} */({
      messages: [
        {
          role: 'user',
          contents: [
            {
              type: 'text',
              content: 'hello world',
            }
          ]
        },
      ],
      metadata: {
        thread_id: id,
        created_at: new Date().toISOString(),
        extra: {
          a1: 1,
        }
      },
    })


    const success = await app.api.chats.upload(
      id, chat
    );

    assert.ok(success, 'upload failed');

    const get_stream = await app.api.chats.download(
      id, false
    );

    // let's turn stream into string and then parse
    const res_string = await stream_to_string(get_stream.stream.value);
    const json = JSON.parse(res_string);

    assert.equal(
      json, chat, 
      'uploaded and downloaded chat don\'t match'
    );
  });

  s('download non-existing chat', async (ctx) => {

    const id = ID('chat');

    const get_stream = await app.api.chats.download(
      id, false
    );

    console.dir(get_stream, { depth: 5 });
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
    console.log(e);
  }
})();

