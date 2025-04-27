/**
 * @import { BaseType } from '../../api/types.api.js'
 * @import { ApiQuery } from '../../api/types.api.query.js'
 * @import { Test } from 'uvu'
 * @import { 
 *  QueryTestContext, CrudTestContext, PartialBase 
 * } from './api.utils.types.js'
 */
import * as assert from 'uvu/assert';
import { 
  assert_async_throws, assert_partial, assert_partial_v2 
} from './api.utils.js';
import { assert_query_list_integrity } from './api.query.js';
import { iso } from './api.utils.js';

/**
 * NOTES:
 * 
 * These are general crud test:
 * - upsert
 * - get
 * - delete
 * - list
 * - query integrity tests
 */

/**
 * A simple CRUD sanity
 * @template {PartialBase} [G=PartialBase]
 * @template {PartialBase} [U=PartialBase]
 * @param {Test<CrudTestContext<G, U>>} s 
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
          assert_partial_v2(v.payload.current, one, 'test upsert event');
          is_event_ok = true;
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
            assert_partial_v2(v.payload.current, one, 'test get event');
            is_event_ok = true;
          } catch (e) {}
        }
      );

      const item_get = await ctx.ops.get(id);
  
      assert_partial_v2(item_get, {...one, id}, 'test get');
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
            assert_partial_v2(v.payload.current, one, 'test update event');
            if(v.payload.previous) {
              assert_partial_v2(v.payload.previous, one, 'test update event 2');
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
            assert_partial_v2(v.payload.previous, one, 'test remove event');
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
 * @description A simple CRUD sanity, we use it to test integrity of lists.
 * However, we have some assumptions:
 * 1. `items` were upserted before the test
 * 2. We have at least 10 items
 * 3. `updated_at` is an ISO of a timestamp starting from number `1`
 * 4. the last 3 items have the same `created_at` timestamp
 * @template {Partial<BaseType>} [G=Partial<BaseType>]
 * @template {Partial<BaseType>} [U=Partial<BaseType>]
 * @param {Test<QueryTestContext<G, U>>} s 
 * @param {boolean} [avoid_setup=false] 
 */
export const add_query_list_integrity_tests = (s, avoid_setup=false) => {
  if(!avoid_setup) {
    s.before(
      async (ctx) => { 
        assert.ok(ctx.app.ready) 
        try {
          for(const p of ctx.items) {
            await ctx.ops.remove(p.id);
            const id = await ctx.ops.upsert(p);
          }
        } catch(e) {
          console.log(e)
          assert.unreachable('failed to upsert items');
        }
      }
    );
  }

  s.after(
    async (ctx) => {
      assert.ok(ctx.app.ready) 
      try {
        for(const p of ctx.items) {
          await ctx.ops.remove(p.id);
        }
      } catch(e) {
        console.log(e)
        assert.unreachable('failed to remove items');
      }
    }
  )

  s('basic statistics count() test',
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

  s('basic collection count() test',
    async (ctx) => {
      const count = await ctx.ops.count(
        {}
      );

      assert.ok(
        count>=ctx.items.length,
        'count < items.length'
      )
    }
  );

  s('query startAt=(created_at:iso(5)), sortBy=(created_at), order=asc|desc, limit=3', 
    async (ctx) => {
      let is_event_ok = false || !Boolean(ctx.events?.list_event);
      const limit = 1000;

      /** @satisfies {ApiQuery<BaseType>} */
      const q_asc = ({
        // startAt: [['created_at', iso(5)]],
        sortBy: ['created_at'],
        order: 'asc',
        limit: limit,
        expand: ['*'],
        vql: {
          created_at: {
            $gte: iso(5)
          }
        }
      })

      /** @type {ApiQuery<BaseType>} */
      const q_desc = {
        ...q_asc, order: 'desc'
      }

      // sanity test for list events
      const unsub = ctx.app.pubsub.on(
        ctx.events?.list_event,
        v => {
          assert.ok(
            v.payload.current.length>0 && 
            v.payload.current.length<=limit
          );
          is_event_ok=true;
        }
      );

      const list_asc = await ctx.ops.list(q_asc);
      const list_desc = await ctx.ops.list(q_desc);

      // console.log({list_asc})
      // console.log({list_desc})

      assert_query_list_integrity(list_asc, q_asc);
      assert_query_list_integrity(list_desc, q_desc);

      { 
        // for each eligible context item, assert that it is in the list result.
        for(const p of ctx.items.filter(it => it.created_at>=iso(5))) {
          const item_asc = list_asc.find(it => it.id === p.id);
          const item_desc = list_desc.find(it => it.id === p.id);
          assert.ok(
            item_asc, 
            `Did not find original id=${p.id} item in list_asc !!`
          );
          assert.ok(
            item_desc, 
            `Did not find original id=${p.id} item in list_desc !!`
          );
        }
      }

      assert.ok(is_event_ok, 'event error');

      unsub();
      
    }
  );

  s('query endAt=(created_at:iso(5)), sortBy=(created_at), order=asc|desc, limitToLast=2', 
    async (ctx) => {
      /** @type {ApiQuery<BaseType>} */
      const q_asc = {
        vql: {
          created_at: {
            $lt: iso(5)
          }
        },
        sortBy: ['created_at'],
        order: 'asc',
        limitToLast: 1000,
        expand: ['*']
      }

      /** @type {ApiQuery<BaseType>} */
      const q_desc = {
        ...q_asc, order: 'desc'
      }

      const list_asc = await ctx.ops.list(q_asc);
      const list_desc = await ctx.ops.list(q_desc);

      // console.log({list_asc, list_desc})

      assert_query_list_integrity(list_asc, q_asc);
      assert_query_list_integrity(list_desc, q_desc);

      { 
        // for each eligible context item, assert that it is in the list result.
        for(const p of ctx.items.filter(it => it.created_at<iso(5))) {
          const item_asc = list_asc.find(it => it.id === p.id);
          const item_desc = list_desc.find(it => it.id === p.id);
          assert.ok(
            item_asc, 
            `Did not find original id=${p.id} item in list_asc !!`
          );
          assert.ok(
            item_desc, 
            `Did not find original id=${p.id} item in list_desc !!`
          );
        }
      }

      // console.log('list_asc', list_asc)
      // console.log('list_desc', list_desc)
      
    }
  );

  s('Query with start-at cursor', 
    async (ctx) => {
      // items 7-9 have the same `created_at` timestamps, 
      // but the 10th item id has the smallest ID so we refine by ID
      // let's pick one before the last
      const item = ctx.items.at(-2);

      /** @type {ApiQuery<BaseType>} */
      const q = {
        // startAt: [['created_at', item.created_at], ['id', item.id]],
        vql: { // mimic `startAt` cursor
          $or: [
            {
              created_at: {
                $gt: item.created_at
              },
            },
            {
              created_at: {
                $eq: item.created_at
              },
              id: {
                $gte: item.id
              }
            }
          ]
        },
        sortBy: ['created_at', 'id'],
        order: 'asc',
        limit: 1000,
        expand: ['*']
      }

      const list = await ctx.ops.list(q);

      // if(ctx.resource==='customers')
      //   console.log({list})
      // console.log(items)
      // console.log({len: list.length})

      assert_query_list_integrity(list, q);

      assert.ok(list.length>=2, 'should be == 2');

      assert.equal(list[0].id, item.id, 'should have had the same id');

      { 
        // Find the last two items in the list
        for (const p of [ctx.items.at(-2), ctx.items.at(-1)]) {
          const item = list.find(it => it.id === p.id);
          assert.ok(
            item, 
            `Did not find original id=${p.id} item of inserted item !!`
          );
        }

      }

    }

  );

  // return s;
  s('refined query, equals=(created_at:iso(9))', 
    async (ctx) => {
      // last 3 items have the same timestamps, so we refine by ID
      // let's pick one before the last
      const item = ctx.items.at(-1);
      /** @type {ApiQuery<any>} */
      const q = {
        // equals: [['created_at', item.created_at]],
        vql: {
          created_at: {
            $eq: item.created_at
          },
        },
        sortBy: ['created_at', 'id'],
        order: 'asc',
        expand: ['*'],
        limit: 1000
      }

      const list = await ctx.ops.list(q);

      // console.log(list)
      // console.log(items)

      assert_query_list_integrity(list, q);

      { 
        // Find the last item in the list
        for (const p of [item]) {
          const item = list.find(it => it.id === p.id);
          assert.ok(
            item, 
            `Did not find original id=${p.id} item of inserted item !!`
          );
        }

      }

    }

  );

  return s;
}
