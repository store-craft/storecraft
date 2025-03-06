/**
 * @import { BaseType } from '../../api/types.api.js'
 * @import { ApiQuery } from '../../api/types.api.query.js'
 * @import { PubSubEvent } from '../../pubsub/types.public.js'
 * 
 */

import * as assert from 'uvu/assert';
import { basename } from "node:path";
import { fileURLToPath } from "node:url";
import { App } from '../../index.js'
import { assert_async_throws, assert_partial } from './utils.js';
import { to_handle } from '../../api/utils.func.js';
import { 
  image_url_to_handle, image_url_to_name 
} from '../../api/con.images.logic.js';

/**
 * timestamp to iso
 * 
 * 
 * @param {number} number 
 */
export const iso = number => {
  return new Date(number).toISOString();
}

/**
 * @param {string | URL} meta_url 
 */
export const file_name = (meta_url) => {
  return basename(fileURLToPath(meta_url));
}


/**
 * Execute a bunch of functions, that create promises sequentially.
 * All tests promises run in serial to avoid transactions locks.
 * 
 * 
 * @template T
 * 
 * 
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
export const create_title_gen = (...prefixs) => {
  let index = 0;
  return () => {
    return [...prefixs, index+=1].join(' ');
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
 * @typedef {Partial<BaseType>} PartialBase
 */

/**
 * @template {PartialBase} [G=PartialBase]
 * @template {PartialBase} [U=PartialBase]
 * 
 * @typedef {object} CrudTestContext
 * @prop {Partial<U>[]} items
 * @prop {object} ops
 * @prop {(item: Partial<U>) => Promise<string>} [ops.upsert]
 * @prop {(id: string) => Promise<G>} [ops.get]
 * @prop {(id: string) => Promise<boolean>} [ops.remove]
 * @prop {object} events
 * @prop {PubSubEvent} events.upsert_event
 * @prop {PubSubEvent} events.get_event
 * @prop {PubSubEvent} events.remove_event
 * @prop {App} app
 * 
 */


/**
 * A simple CRUD sanity
 * @template {PartialBase} [G=PartialBase]
 * @template {PartialBase} [U=PartialBase]
 * 
 * @param {import('uvu').uvu.Test<CrudTestContext<G, U>>} s 
 */
export const add_sanity_crud_to_test_suite = s => {
    
  s('upsert, get, update, remove', async (ctx) => {
    const one = ctx.items[0];

    let id;

    { // test upsert
      let is_event_ok = false;
      const unsub = ctx.app.pubsub.on(
        ctx.events.upsert_event,
        v => {
          try {
            
            assert_partial(v.payload.current, one);
            is_event_ok = true;
          } catch (e) {}
        }
      );
  
      id = await ctx.ops.upsert(one);
  
      assert.ok(id, 'insertion failed (test upsert)');
      assert.ok(is_event_ok, 'event error (test upsert)');

      unsub();
    }

    
    { // test get
      let is_event_ok = false;
      const unsub = ctx.app.pubsub.on(
        ctx.events.get_event,
        v => {
          try {
            assert_partial(v.payload.current, one);
            is_event_ok = true;
          } catch (e) {}
        }
      );

      const item_get = await ctx.ops.get(id);
  
      assert_partial(item_get, {...one, id});
      assert.ok(is_event_ok, 'event error (test get)');

      unsub();
    }

    { // test update
      let is_event_ok = false;

      // test upsert event shows previous
      const unsub = ctx.app.pubsub.on(
        ctx.events.upsert_event,
        async v => {
          try {
            assert_partial(v.payload.current, one);
            if(v.payload.previous) {
              assert_partial(v.payload.previous, one);
            }
            is_event_ok = true;
          } catch (e) {
            console.log(e)
          }
        }
      );
  
      id = await ctx.ops.upsert({...one, id});
  
      assert.ok(id, 'insertion failed (test update)');
      assert.ok(is_event_ok, 'event error (test update)');

      unsub();
    }

    
    { // test remove

      let is_event_ok = false;

      // test upsert shows previous
      const unsub = ctx.app.pubsub.on(
        ctx.events.remove_event,
        v => {
          try {
            assert_partial(v.payload.previous, one);
            is_event_ok = true;
          } catch (e) {}
        }
      );

      const success = await ctx.ops.remove(id);
      const item_get = await ctx.ops.get(id);

      assert.ok(success, 'item removal was not successful ! (test remove)')
      assert.not(item_get, 'item was not removed ! (test remove)')
      assert.ok(is_event_ok, 'event error (test remove)');

      unsub();
    }

  });

  s('missing fields should throw', async (ctx) => {
    await assert_async_throws(
      // @ts-ignore
      async () => await ctx.ops.upsert({})
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
 * @description Basic testing to see if a query result is satisfied:
 * - Test `limit` is correct
 * - Test `sortBy` by comapring consecutive items
 * - Test `start` / `end` ranges are respected
 * 
 * @template {PartialBase} T
 * 
 * @param {T[]} list the result of the query
 * @param {ApiQuery<any>} q the query used
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
 * @template {PartialBase} [G=PartialBase]
 * @template {PartialBase} [U=PartialBase]
 * 
 * @typedef {object} ListTestContext
 * @prop {Partial<G>[]} items
 * @prop {keyof Omit<App["db"]["resources"], 'search'>} resource
 * @prop {object} ops
 * @prop {(item: G) => Promise<string>} [ops.upsert]
 * @prop {(id: string) => Promise<G>} [ops.get]
 * @prop {(id: string) => Promise<boolean>} [ops.remove]
 * @prop {(q: ApiQuery<G>) => Promise<G[]>} [ops.list]
 * @prop {object} [events]
 * @prop {PubSubEvent} events.list_event
 * @prop {App} app
 * 
 */


/**
 * @description A simple CRUD sanity, we use it to test integrity of lists.
 * 
 * However, we have some assumptions:
 * 
 * 1. `items` were upserted before the test
 * 2. We have at least 10 items
 * 3. `updated_at` is an ISO of a timestamp starting from number `1`
 * 
 * 
 * 
 * @template {PartialBase} [G=PartialBase]
 * @template {PartialBase} [U=PartialBase]
 * 
 * @param {import('uvu').uvu.Test<ListTestContext<G, U>>} s 
 */
export const add_list_integrity_tests = s => {
  s('basic count() test',
    async (ctx) => {
      const count = await ctx.app.api.statistics.compute_count_of_query(
        ctx.resource, {}
      );

      assert.ok(
        count>=ctx.items.length,
        'count < items.length'
      )
    }
  );

  s('query startAt=(updated_at:iso(5)), sortBy=(updated_at), order=asc|desc, limit=3', 
    async (ctx) => {
      let is_event_ok = false || !Boolean(ctx.events?.list_event);
      const limit = 3;

      /** @type {ApiQuery<any>} */
      const q_asc = {
        startAt: [['created_at', iso(5)]],
        sortBy: ['created_at'],
        order: 'asc',
        limit: limit,
        expand: ['*']
      }

      /** @type {ApiQuery<any>} */
      const q_desc = {
        ...q_asc, order: 'desc'
      }

      // sanity test for list events
      const unsub = ctx.app.pubsub.on(
        ctx.events?.list_event,
        v => {
          assert.ok(v.payload.current.length==limit);
          is_event_ok=true;
        }
      );

      const list_asc = await ctx.ops.list(q_asc);
      const list_desc = await ctx.ops.list(q_desc);

      assert_query_list_integrity(list_asc, q_asc);
      assert_query_list_integrity(list_desc, q_desc);

      { 
        // for each list item find it's original seed item and make sure
        // all of it's properties are getting back
        for(const p of list_asc) {
          const original_item = ctx.items.find(it => it.id===p.id);
          if(!original_item) {
            console.log(`\nWarning: Did not find original item of inserted item !! likely due
              to other competing items in the query, no big deal, but make sure to remove these old timestamps`);
            continue;
          }

          // console.log(p)
          assert.ok(original_item, 'Did not find original item of inserted item !!');
          // assert_partial(p, original_item);
          // console.log(original_item)
          assert_partial(p, original_item);
        }
      }

      assert.ok(is_event_ok, 'event error');

      unsub();
      
    }
  );

  
  s('query startAt=(end_at:iso(5)), sortBy=(updated_at), order=asc|desc, limitToLast=2', 
    async (ctx) => {
      /** @type {ApiQuery<any>} */
      const q_asc = {
        endAt: [['updated_at', iso(5)]],
        sortBy: ['updated_at'],
        order: 'asc',
        limitToLast: 2,
        expand: ['*']
      }
      /** @type {ApiQuery<any>} */
      const q_desc = {
        ...q_asc, order: 'desc'
      }

      const list_asc = await ctx.ops.list(q_asc);
      const list_desc = await ctx.ops.list(q_desc);

      assert_query_list_integrity(list_asc, q_asc);
      assert_query_list_integrity(list_desc, q_desc);

      { 
        // for each list item find it's original seed item and make sure
        // all of it's properties are getting back
        for(const p of list_asc) {
          const original_item = ctx.items.find(it => it.id===p.id);
          if(!original_item) {
            console.log(`\nWarning: Did not find original item of inserted item !! likely due
              to other competing items in the query, no big deal`);
            continue;
          }
          // console.log('ctx.items', ctx.items)
          // console.log('list_asc', list_asc)
          // console.log('original_item', original_item)
          // console.log('p', p)
          // assert.ok(original_item, 'Did not find original item of inserted item !!');
          // console.log(original_item)
          assert_partial(p, original_item);
        }
      }

      // console.log('list_asc', list_asc)
      // console.log('list_desc', list_desc)
      
    }
  );

  s('refined query', 
    async (ctx) => {
      // last 3 items have the same timestamps, so we refine by ID
      // let's pick one before the last
      const item = ctx.items.at(-2);
      /** @type {ApiQuery<any>} */
      const q = {
        startAt: [['updated_at', item.updated_at], ['id', item.id]],
        sortBy: ['updated_at', 'id'],
        order: 'asc',
        limit: 2,
        expand: ['*']
      }

      const list = await ctx.ops.list(q);

      // console.log(list)
      // console.log(items)

      assert_query_list_integrity(list, q);
      assert.equal(list[0].id, item.id, 'should have had the same id');

      { 
        // for each list item find it's original seed item and make sure
        // all of it's properties are getting back
        for(const p of list) {
          const original_item = ctx.items.find(it => it.id===p.id);

          if(!original_item) {
            console.log(`\nWarning: Did not find original item of inserted item !! likely due
              to other competing items in the query, no big deal, but make sure to remove these old timestamps`);
            continue;
          }

          assert.ok(
            original_item, 'Did not find original item of inserted item !!'
          );

          assert_partial(p, original_item);
        }

      }

    }

  );

  return s;
}
