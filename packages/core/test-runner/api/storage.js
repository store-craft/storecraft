/**
 * @import { PROOF_MOCKUP_API_SETUP } from './types.js'
 */
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { file_name } from '../api/api.utils.crud.js';
import { App } from '../../index.js';
import esMain from '../api/utils.esmain.js';
import { assert_async_throws } from '../api/utils.js';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { 
  areArrayBuffersEqual,
  readable_stream_to_array_buffer,
  readable_stream_to_string, 
  to_readable_stream 
} from './storage.utils.js';

const __filename = fileURLToPath(import.meta.url);

const create_data = () => {
  const iso = new Date().toISOString();
  const value = iso;
  const buffer = new TextEncoder().encode(value);
  const stream = to_readable_stream(buffer);

  return {
    key: `__test__/${iso}.txt`,
    value,
    buffer,
    stream,
    bytes_length: buffer.length,
    type: 'text/plain',
  }
};


/**
 * @param {App} app `storecraft` app instance
 */
export const create = (app) => {

  const s = suite(
    file_name(import.meta.url), 
    {}
  );

  s.before(
    async () => { 
      await app.init();
      assert.ok(app.ready);
    }
  );

  s.after(
    async () => { 
    }
  );

  s('storage features', async (ctx) => {

    const features = await app.api.storage.features();

    assert.ok(features, 'no features');

  });

  s('storage put -> get (presigned)', async (ctx) => {
    const features = await app.api.storage.features();

    if(!features.supports_signed_urls) {
      console.log('skipping signed urls test');
      return;
    }

    const {
      key,
      type,
      buffer,
      value,
      stream,
      bytes_length
    } = create_data();

    // get put presigned url
    const { 
      url, method, headers 
    } = await app.api.storage.putSigned(key);

    // now let's use it to upload
    const response = await fetch(
      url, {
        method,
        headers,
        body: stream
      }
    );

    assert.ok(response.ok, `putSigned failed to upload for ${url}`);

    { // now let's read it back, once with presigned url
      const {
        method, url, headers
      } = await app.api.storage.getSigned(key);
      const r_get = await fetch(
        url, {
          method,
          headers,
        }
      );

      // compare to original
      const equal = await areArrayBuffersEqual(
        await r_get.arrayBuffer(), 
        buffer.buffer
      );
      assert.ok(
        equal, 
        'Buffers are not equal when compared with presigned get !!!'
      );
    }
    { // now let's read it back with normal get
      const { value: stream_read } = await app.api.storage.getStream(key);
      
      // compare to original
      const equal = await areArrayBuffersEqual(
        await readable_stream_to_array_buffer(
          stream_read
        ),
        buffer.buffer
      );
      assert.ok(equal, 'Buffers are not equal with regular get !!!');
    }     

  });

  s('storage put -> get -> remove (unsigned)', async (ctx) => {
    const {
      key,
      type,
      buffer,
      value,
      stream,
      bytes_length
    } = create_data();

    const success = await app.api.storage.putStream(
      key,
      stream,
      { contentType: type },
      bytes_length
    );

    assert.ok(success, 'putStream failed');

    { // verify get
      const {
        value: get_stream
      } = await app.api.storage.getStream(key);

      const actual = await readable_stream_to_string(get_stream);

      assert.equal(actual, value, 'streams are not equal');
    }

    { // remove

      const success = await app.api.storage.remove(key);
      assert.ok(success, 'remove failed');

      const result = await app.api.storage.getStream(key);
      // console.log({result})
      assert.not(result.value, 'value should be undefined');
    }

  });

  s('storage put bad values', async (ctx) => {
    const {
      key,
      type,
      buffer,
      value,
      stream,
      bytes_length
    } = create_data();

    await assert_async_throws(
      () => app.api.storage.putStream(
        '',
        stream,
        { contentType: type },
        bytes_length
      ),
      'empty key should have thrown'
    );

    await assert_async_throws(
      () => app.api.storage.putStream(
        key,
        undefined,
        { contentType: type },
        bytes_length
      ),
      'undefined stream should have thrown'
    )
  });

  s('storage get bad values', async (ctx) => {

    await assert_async_throws(
      () => app.api.storage.getStream(''),
      'empty key should have thrown'
    );

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