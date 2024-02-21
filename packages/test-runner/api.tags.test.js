import { tags } from '@storecraft/core/v-api';
import 'dotenv/config';
import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { assert_async_throws, assert_partial, create_app } from './utils.js';

const app = await create_app();

test.before(async () => { assert.ok(app.ready) });

test('remove-and-upsert-new-tag', async () => {
  /** @type {import('@storecraft/core').TagTypeUpsert} */
  const tag_insert = {
    handle: 'tag-remove-and-upsert-new-tag', values:['a', 'b']
  }
  const tag = await tags.get(app, tag_insert.handle);
  if(tag) {
    // console.log(tag)
    await tags.remove(app, tag.id);
    const should_be_undefined = await tags.get(app, tag.handle);
    assert.not(should_be_undefined, 'should be undefined')
  }

  const id = await tags.upsert(app, tag_insert);
  const tag_get = await tags.get(app, id);

  assert_partial(tag_get, {...tag_insert, id});
});


test('upsert tag with bad handle', async () => {
  /** @type {import('@storecraft/core').TagTypeUpsert} */
  const tag_insert = {
    handle: 'tag 2', values:['a', 'b']
  }
  await assert_async_throws(
    async () => await tags.upsert(app, tag_insert)
  );

})

test('upsert tag with bad values', async () => {
  /** @type {import('@storecraft/core').TagTypeUpsert} */
  const tag_insert = {
    handle: 'tag-never', values:['a ddd', 'b']
  }
  await assert_async_throws(
    async () => await tags.upsert(app, tag_insert)
  );

})

test('upsert new tag with existing handle should throw', async () => {
  /** @type {import('@storecraft/core').TagTypeUpsert} */
  const tag_insert = {
    handle: 'tag-2', values:['a', 'b']
  }
  const tag_get = await tags.get(app, tag_insert.handle);
  if(!tag_get) {
    await tags.upsert(app, tag_insert);
  }
  await assert_async_throws(
    async () => await tags.upsert(app, tag_insert)
  );

})

test('upsert tag with non existing id should throw', async () => {
  /** @type {import('@storecraft/core').TagTypeUpsert} */
  const tag_insert = {
    handle: 'tag-2', values:['a', 'b'], id: 'jiji'
  }
  await assert_async_throws(
    async () => await tags.upsert(app, tag_insert)
  );

})


test.run();
