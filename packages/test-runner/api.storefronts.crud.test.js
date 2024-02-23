import 'dotenv/config';
import { storefronts } from '@storecraft/core/v-api';
import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { assert_async_throws, assert_partial, create_app } from './utils.js';

const app = await create_app();

/** @type {import('@storecraft/core').StorefrontTypeUpsert[]} */
const items_upsert = [
  {
    handle: 'sf-1', title: 'sf 1'
  },
  {
    handle: 'sf-2', title: 'sf 2'
  },
  {
    handle: 'sf-3', title: 'sf 3'
  },
]

test.before(async () => { assert.ok(app.ready) });
test.after(async () => { await app.db.disconnect() });
const ops = storefronts;

test('create', async () => {
  const one = items_upsert[0];
  const item = await ops.get(app, one.handle);

  if(item) {
    // console.log(tag)
    await ops.remove(app, item.id);
    const should_be_undefined = await ops.get(app, item.handle);
    assert.not(should_be_undefined, 'should be undefined')
  }

  const id = await ops.upsert(app, one);
  const item_get = await ops.get(app, id);

  assert_partial(item_get, {...one, id});
});

test('update', async () => {
  const one = items_upsert[1];
  let item = await ops.get(app, one.handle);
  if(!item) {
    await ops.upsert(app, one);
  }
  item = await ops.get(app, one.handle);

  // now, le's update
  const id = await ops.upsert(app, item);
  const item_get = await ops.get(app, id);

  assert_partial(item_get, {...one, id});
});

test('missing fields should throw', async () => {
  await assert_async_throws(
    async () => await ops.upsert(app, {})
  );
})

test('insert new with existing email should throw', async () => {
  const one = items_upsert[2];
  let item = await ops.get(app, one.handle);
  if(!item) {
    await ops.upsert(app, one);
  }
  // without id and same handle should throw
  await assert_async_throws(
    async () => await ops.upsert(app, one)
  );

})

test('update with non existing id should throw', async () => {
  const one = { ...items_upsert[2], id: 'lihcwihiwe9ewh' };
  await assert_async_throws(
    async () => await ops.upsert(app, one)
  );
})

test.run();
