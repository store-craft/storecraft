import { products } from '@storecraft/core/v-api';
import 'dotenv/config';
import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { assert_async_throws, assert_partial, create_app } from './utils.js';

const app = await create_app();

/** @type {import('@storecraft/core').ProductTypeUpsert[]} */
const items_upsert = [
  {
    handle: 'pr-1',
    active: true,
    price: 50,
    qty: 1,
    title: 'product 1'
  },
  {
    handle: 'pr-2',
    active: true,
    price: 150,
    qty: 2,
    title: 'product 2',
  },
  {
    handle: 'pr-3',
    active: true,
    price: 250,
    qty: 3,
    title: 'product 3',
  },
]

test.before(async () => { assert.ok(app.ready) });
test.after(async () => { await app.db.disconnect() });
const ops = products;

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

test('insert new with existing handle should throw', async () => {
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
