/**
 * @import { BaseType } from '../../api/types.api.js'
 * @import { ApiQuery } from '../../api/types.api.query.js'
 * @import { 
 *  PartialBase 
 * } from './api.utils.types.js';
 * @import { VQL } from '../../vql/types.js';
 */
import * as assert from 'uvu/assert';
import { test_vql_against_object } from '../../vql/utils.js';

/**
 * Notes:
 * This file contain assertion method to test the integrity of a query result.
 * Using VQL query, we can test the integrity of the result.
 */

/**
 * @description Compare **Lexicographically** two tuples of any type
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
 * - Test `sortBy` by comparing consecutive items
 * - Test `start` / `end` ranges are respected
 * @template {PartialBase} T
 * @param {T[]} list the result of the query
 * @param {ApiQuery<any>} q the query used
 */
export const assert_query_list_integrity = (list, q) => {
  const asc = q.order==='asc';

  // assert limit
  q.limit && assert.ok(list.length<=q.limit, `list.length > q.limit`);
  q.limitToLast && assert.ok(
    list.length<=q.limitToLast, `ist.length > q.limitToLast`
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

  assert_items_against_vql_integrity(
    list, q.vql, [], {query: q}
  );


  // // asc:  (0, 1, 2, 3, 4, 5, )
  // // desc: (5, 4, 3, 2, 1, 0, )
  // // assert startAt/endAt integrity
  // const from = q.startAfter ?? q.startAt;
  // const to = q.endBefore ?? q.endAt;
  // // console.log(list)
  // if(from || to) {
  //   for(let ix=1; ix < list.length; ix++) {
  //     const it = list[ix];

  //     if(from) {
  //       const v1 = from.map(c => c[1]);
  //       const v2 = from.map(c => it[c[0]]);
  //       const sign = compare_tuples(v2, v1) * (asc ? 1 : -1);
  //       assert.ok(
  //         q.startAt ? sign>=0 : sign>0, 
  //         `list item #${ix} does not obey ${from} !`
  //       );
  //     }

  //     if(to) {
  //       const v1 = to.map(c => c[1]);
  //       const v2 = to.map(c => it[c[0]]);
  //       const sign = compare_tuples(v2, v1) * (asc ? 1 : -1);
  //       assert.ok(
  //         q.endAt ? sign<=0 : sign < 0, 
  //         `list item #${ix} does not obey ${to} !`
  //       );
  //     }
  //   }
  // }
}


/**
 * @description Test that an item satisfies the 
 * `VQL` filters / constraints.
 * @template {PartialBase} [T=PartialBase]
 * @param {VQL<PartialBase>} vql the query used
 * @param {T} item the result of the query
 * @param {string[]} [search_index=[]] Optional 
 * search index for `$search` operator
 * @param {any} [context={}] Optional context
 */
export const assert_item_against_vql_integrity = (
  vql, item, search_index=[], context
) => {
  // skip early
  if(!vql || !item) 
    return;

  const result = test_vql_against_object(
    vql, item, [], false
  );

  if(!result) {
    console.dir(
      {context}, {depth: 15}
    );

    console.dir(
      {vql}, {depth: 15}
    );

    console.dir(
      {item}, {depth: 15}
    );

    // run again with `debug` mode for printing the
    // chain of tests.
    test_vql_against_object(
      vql, item, search_index, true
    );

    assert.unreachable(
      `assert_item_against_vql_integrity:: item does not satisfy vql !`
    );
  } 
}

/**
 * @description Test that items satisfies the 
 * `VQL` filters / constraints.
 * @template {PartialBase} [T=PartialBase]
 * @param {VQL<PartialBase>} vql the query used
 * @param {T[]} items the result of the query
 * @param {string[]} [search_index=[]] Optional 
 * search index for `$search` operator
 * @param {any} [context={}] Optional context
 */
export const assert_items_against_vql_integrity = (
  items, vql, search_index=[], context
) => {
  for(const item of items) {
    assert_item_against_vql_integrity(
      vql, item, search_index, context
    );
  }
}