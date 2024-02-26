import * as assert from 'uvu/assert';
import { basename } from "node:path";
import { fileURLToPath } from "node:url";
import { App } from '@storecraft/core'
import { assert_async_throws, assert_partial } from './utils.js';

export const file_name = (meta_url) => {
  return basename(fileURLToPath(meta_url));
}

/**
 * @template T
 * @param {T[]} items 
 */
export const pick_random = items => {
  const idx = Math.floor(Math.random() * (items.length - 1));
  return items.at(idx);
}

/**
 * A simple CRUD sanity
 * @template {{
 *  items: T[],
 *  ops: {
 *    upsert: (app: App, item: T) => Promise<string>,
 *    get: (app: App, id: string) => Promise<T>,
 *  }
 *  app: App
 * }} T
 * @param {import('uvu').uvu.Test<T>} s 
 */
export const add_sanity_crud_to_test_suite = s => {
  
  s('create', async (ctx) => {
    const one = ctx.items[0];
    const id = await ctx.ops.upsert(ctx.app, one);
  
    assert.ok(id, 'insertion failed');
  
    const item_get = await ctx.ops.get(ctx.app, id);
    assert_partial(item_get, {...one, id});
  });
  
  s('update', async (ctx) => {
    const one = ctx.items[1];
    const id = await ctx.ops.upsert(ctx.app, one);
  
    assert.ok(id, 'insertion failed');
  
    // now let's update, for that we use the id
    // one.active = false;  
    await ctx.ops.upsert(ctx.app, {...one, id});
    const item_get = await ctx.ops.get(ctx.app, id);
  
    assert_partial(item_get, {...one, id});
  });
  
  s('missing fields should throw', async (ctx) => {
    await assert_async_throws(
      async () => await ctx.ops.upsert(ctx.app, {})
    );
  })
  
  s('insert new with existing handle should throw', async (ctx) => {
    const one = ctx.items[0];
    if(!one.handle)
      return;
    // without id and same handle should throw
    await assert_async_throws(
      async () => await ctx.ops.upsert(ctx.app, one)
    );
  
  })
  
  s('update with non existing id should throw', async (ctx) => {
    const one = { ...ctx.items[0], id: 'lihcwihiwe9ewh' };
    await assert_async_throws(
      async () => await ctx.ops.upsert(ctx.app, one)
    );
  })
  
  return s;
}

