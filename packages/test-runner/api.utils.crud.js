import * as assert from 'uvu/assert';
import { basename } from "node:path";
import { fileURLToPath } from "node:url";
import { App } from '@storecraft/core'
import { assert_async_throws, assert_partial } from './utils.js';
import { to_handle } from '@storecraft/core/v-api/utils.func.js';
import { image_url_to_handle, 
  image_url_to_name } from '@storecraft/core/v-api/con.images.logic.js';
import { compute_count_of_query } from '@storecraft/core/v-api/con.statistics.logic.js';

/** timestamp to iso */
export const iso = number => {
  return new Date(number).toISOString();
}

export const file_name = (meta_url) => {
  return basename(fileURLToPath(meta_url));
}

/**
 * Execute a bunch of functions, that create promises sequentially.
 * All tests promises run in serial to avoid transactions locks.
 * @template T
 * @param {(() => Promise<T>)[]} items 
 */
export const promises_sequence = async (items) => {
  const results = [];
  for(const it of items)
    results.push(await it())
  return results;
}

/**
 * @param  {...string} prefixs 
 */
export const create_handle = (...prefixs) => {
  let index = 0;
  return () => {
    return to_handle([...prefixs, index+=1].join('-'));
  }
}

/**
 * @param  {...string} prefixs 
 */
export const image_mock_url_handle_name = (...prefixs) => {
  let index = 0;
  
  return () => {
    const url = [...prefixs, index+=1].join('-') + '.png';
    return {
      url: url,
      name: image_url_to_name(url),
      handle: image_url_to_handle(url)
    }
  }
}

/**
 * a list of 10 static ids, this is helpful for testing
 * @param {string} prefix 
 */
export const get_static_ids = (prefix) => {
  return [
    '65e5ca42c43e2c41ae5216a9',
    '65e5ca42c43e2c41ae5216aa',
    '65e5ca42c43e2c41ae5216ab',
    '65e5ca42c43e2c41ae5216ac',
    '65e5ca42c43e2c41ae5216ad',
    '65e5ca42c43e2c41ae5216ae',
    '65e5ca42c43e2c41ae5216af',
    '65e5ca42c43e2c41ae5216b0',
    '65e5ca42c43e2c41ae5216b1',
    '65e5ca42c43e2c41ae5216b2'
  ].map(id => `${prefix}_${id}`);
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
 * @template G
 * @template {{
 *  items: G[],
 *  ops: {
 *    upsert?: (app: App, item: G) => Promise<string>,
 *    get?: (app: App, id: string) => Promise<G>,
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
  
  return s;
}

/**
 * 
 * @param {any[]} vec1 
 * @param {any[]} vec2 
 */
const compare_tuples = (vec1, vec2) => {
  for(let ix = 0; ix < vec1.length; ix++) {
    const v1 = vec1[ix], v2 = vec2[ix];
    if(v1===v2) continue;
    if(v1>v2) return 1;
    if(v1<v2) return -1;
  }
  return 0;
}

/**
 * Basic testing to see if a query result is satisfied:
 * - Test `limit` is correct
 * - Test `sortBy` by comapring consecutive items
 * - Test `start` / `end` ranges are respected
 * 
 * @template {import('@storecraft/core/v-api').BaseType} T
 * 
 * @param {T[]} list the result of the query
 * @param {import('@storecraft/core/v-api').ApiQuery} q the query used
 */
export const assert_query_list_integrity = (list, q) => {
  const asc = q.order==='asc';

  // assert limit
  q.limit && assert.equal(list.length, q.limit, `limit != ${list.length}`);
  q.limitToLast && assert.equal(
    list.length, q.limitToLast, `limitToLast != ${list.length}`
    );

  // assert order
  if(q.sortBy) {
    const order_preserved = list.slice(1).every(
      (it, ix) => {
        const prev = q.sortBy.map(c => list[ix][c[0]]);
        const current = q.sortBy.map(c => it[c[0]]);
        const sign = compare_tuples(current, prev);
        assert.ok(
          asc ? sign>=0 : sign<=0, 
          `list item #${ix-1} does not preserve order !`
        );
      }
    );
  }

  // asc:  (0, 1, 2, 3, 4, 5, )
  // desc: (5, 4, 3, 2, 1, 0, )
  // assert startAt/endAt integrity
  const from = q.startAfter ?? q.startAt;
  const to = q.endBefore ?? q.endAt;
  // console.log(list)
  if(from || to) {
    for(let ix=1; ix < list.length; ix++) {
      const it = list[ix];

      if(from) {
        const v1 = from.map(c => c[1]);
        const v2 = from.map(c => it[c[0]]);
        const sign = compare_tuples(v2, v1) * (asc ? 1 : -1);
        assert.ok(
          q.startAt ? sign>=0 : sign>0, 
          `list item #${ix} does not obey ${from} !`
        );
      }

      if(to) {
        const v1 = to.map(c => c[1]);
        const v2 = to.map(c => it[c[0]]);
        const sign = compare_tuples(v2, v1) * (asc ? 1 : -1);
        assert.ok(
          q.endAt ? sign<=0 : sign < 0, 
          `list item #${ix} does not obey ${to} !`
        );
      }
    }
  }
}


/**
 * A simple CRUD sanity, we use it to test integrity of lists.
 * 
 * However, we have some assumptions:
 * 
 * 1. `items` were upserted before the test
 * 2. We have at least 10 items
 * 3. `updated_at` is an ISO of a timestamp starting from number `1`
 * 
 * 
 * @template {import('@storecraft/core/v-api').BaseType & 
 *  import('@storecraft/core/v-api').timestamps
 * } T
 * 
 * @template {{
 *  resource: (keyof App["db"]["resources"])
 *  items: T[],
 *  ops: {
 *    upsert?: (app: App, item: T) => Promise<string>,
 *    get?: (app: App, id: string) => Promise<T>,
 *    list?: (app: App, q: import('@storecraft/core/v-api').ApiQuery) => Promise<T[]>,
 *    count?: (app: App, resource: string, q: import('@storecraft/core/v-api').ApiQuery) => Promise<number>
 *  }
 *  app: App
 * }} C
 * 
 * @param {import('uvu').uvu.Test<C>} s 
 */
export const add_list_integrity_tests = s => {
  s('basic count() test',
    async (ctx) => {
      const count = await compute_count_of_query(
        ctx.app, ctx.resource, {}
      );

      assert.ok(
        count>=ctx.items.length,
        'count < items.length'
      )
    }
  );

  s('query startAt=(updated_at:iso(5)), sortBy=(updated_at), order=asc|desc, limit=3', 
    async (ctx) => {
      /** @type {import('@storecraft/core/v-api').ApiQuery} */
      const q_asc = {
        startAt: [['updated_at', iso(5)]],
        sortBy: ['updated_at'],
        order: 'asc',
        limit: 3,
        expand: ['*']
      }
      /** @type {import('@storecraft/core/v-api').ApiQuery} */
      const q_desc = {
        ...q_asc, order: 'desc'
      }

      const list_asc = await ctx.ops.list(ctx.app, q_asc);
      const list_desc = await ctx.ops.list(ctx.app, q_desc);

      assert_query_list_integrity(list_asc, q_asc);
      assert_query_list_integrity(list_desc, q_desc);

      { 
        // for each list item find it's original seed item and make sure
        // all of it's properties are getting back
        for(const p of list_asc) {
          const original_item = ctx.items.find(it => it.id===p.id);
          // console.log(p)
          assert.ok(original_item, 'Did not find original item of inserted item !!');
          // assert_partial(p, original_item);
          // console.log(original_item)
          assert_partial(p, original_item);
        }
      }
      
    }
  );

  s('query startAt=(end_at:iso(5)), sortBy=(updated_at), order=asc|desc, limitToLast=2', 
    async (ctx) => {
      /** @type {import('@storecraft/core/v-api').ApiQuery} */
      const q_asc = {
        endAt: [['updated_at', iso(5)]],
        sortBy: ['updated_at'],
        order: 'asc',
        limitToLast: 2,
        expand: ['*']
      }
      /** @type {import('@storecraft/core/v-api').ApiQuery} */
      const q_desc = {
        ...q_asc, order: 'desc'
      }

      const list_asc = await ctx.ops.list(ctx.app, q_asc);
      const list_desc = await ctx.ops.list(ctx.app, q_desc);

      assert_query_list_integrity(list_asc, q_asc);
      assert_query_list_integrity(list_desc, q_desc);

      { 
        // for each list item find it's original seed item and make sure
        // all of it's properties are getting back
        for(const p of list_asc) {
          const original_item = ctx.items.find(it => it.id===p.id);
          // console.log(p)
          assert.ok(original_item, 'Did not find original item of inserted item !!');
          // assert_partial(p, original_item);
          // console.log(original_item)
          assert_partial(p, original_item);
        }
      }

      // console.log('list_asc', list_asc)
      // console.log('list_desc', list_desc)

      // test `limitToLast` works, this is a lame test
      {
        assert.ok(list_asc[0].updated_at===iso(4), 'limitToLast asc not working !!');
        assert.ok(list_asc[1].updated_at===iso(5), 'limitToLast asc not working !!');

        assert.ok(list_desc[0].updated_at===iso(6), 'limitToLast desc not working !!');
        assert.ok(list_desc[1].updated_at===iso(5), 'limitToLast desc not working !!');
      }
      
    }
  );

  s('refined query', 
    async (ctx) => {
      // last 3 items have the same timestamps, so we refine by ID
      // let's pick one before the last
      const item = ctx.items.at(-2);
      /** @type {import('@storecraft/core/v-api').ApiQuery} */
      const q = {
        startAt: [['updated_at', item.updated_at], ['id', item.id]],
        sortBy: ['updated_at', 'id'],
        order: 'asc',
        limit: 2,
        expand: ['*']
      }

      const list = await ctx.ops.list(
        ctx.app, q
      );

      // console.log(list)
      // console.log(items)

      assert_query_list_integrity(list, q);
      assert.equal(list[0].id, item.id, 'should have had the same id');

      { 
        // for each list item find it's original seed item and make sure
        // all of it's properties are getting back
        for(const p of list) {
          const original_item = ctx.items.find(it => it.id===p.id);
          assert.ok(original_item, 'Did not find original item of inserted item !!');
          assert_partial(p, original_item);
        }
      }

    }
  );

  return s;
}
