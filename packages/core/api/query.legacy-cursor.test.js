/** 
 * @import { ApiQuery, Tuple } from '../api/types.api.query.js';
 * @import { BaseType } from './types.api.js';
 */
import 'dotenv/config';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { file_name } from '../test-runner/api/api.utils.file.js';
import { 
  api_query_to_searchparams, parse_query, 
} from './query.js';
import { assert_partial } from '../test-runner/api/api.utils.js';

const s = suite(
  file_name(import.meta.url), 
);

s('api_query_to_url_query_params_and_back', async () => {
  
  /** @type {{input: ApiQuery<BaseType & {price: number, products: {}[]}>, output: ApiQuery<BaseType & {price: number, products: {}[]}>}[]} */
  const cases = [
    {
      input: {
        endAt: [['updated_at', '2025-03-07T10:34:13.058Z'], ['price', 100], ['active', true]],
        expand: ['products'],
        limit: 10,
        order: 'asc',
        sortBy: ['updated_at', 'price', 'active'],
        startAt: [['updated_at', '"2025-03-07T10:34:13.058Z"'], ['price', 50], ['active', true]],
        vql_as_string: '-a | (b & c)'
      },
      output: {
        expand: [ 'products' ],
        sortBy: [ 'updated_at', 'price', 'active' ],
        order: 'asc',
        limit: 10,
        limitToLast: undefined,
        vql_as_string: '(-a | (b & c)) & ((updated_at<"2025-03-07T10:34:13.058Z") | (updated_at="2025-03-07T10:34:13.058Z" & price<50) | (updated_at="2025-03-07T10:34:13.058Z" & price=50 & active<=true)) & ((updated_at>2025-03-07T10:34:13.058Z) | (updated_at=2025-03-07T10:34:13.058Z & price>100) | (updated_at=2025-03-07T10:34:13.058Z & price=100 & active>=true))',
        vql: {
          '$and': [
            {
              '$or': [
                { '$not': { $search: 'a' } },
                { '$and': [ { $search: 'b' }, { $search: 'c' } ] }
              ]
            },
            {
              '$or': [
                { updated_at: { '$lt': '2025-03-07T10:34:13.058Z' } },
                {
                  '$and': [
                    { updated_at: { '$eq': '2025-03-07T10:34:13.058Z' } },
                    { price: { '$lt': 50 } }
                  ]
                },
                {
                  '$and': [
                    { updated_at: { '$eq': '2025-03-07T10:34:13.058Z' } },
                    { price: { '$eq': 50 } },
                    { active: { '$lte': true } }
                  ]
                }
              ]
            },
            {
              '$or': [
                { updated_at: { '$gt': '2025-03-07T10:34:13.058Z' } },
                {
                  '$and': [
                    { updated_at: { '$eq': '2025-03-07T10:34:13.058Z' } },
                    { price: { '$gt': 100 } }
                  ]
                },
                {
                  '$and': [
                    { updated_at: { '$eq': '2025-03-07T10:34:13.058Z' } },
                    { price: { '$eq': 100 } },
                    { active: { '$gte': true } }
                  ]
                }
              ]
            }
          ]
        }
      }
    },
    {
      input: {
        endBefore: [['updated_at', '"2025-03-07T10:34:13.058Z"'], ['price', 100], ['active', true]],
        sortBy: ['updated_at', 'price', 'active'],
        expand: ['products'],
        limitToLast: 10,
        order: 'desc',
        startAfter: [['updated_at', '"2025-03-07T10:34:13.058Z"'], ['price', 50], ['active', true]],
        vql_as_string: '-a | (b & c)'
      },
      output: {
        expand: [ 'products' ],
        sortBy: [ 'updated_at', 'price', 'active' ],
        order: 'desc',
        limit: undefined,
        limitToLast: 10,
        vql_as_string: '(-a | (b & c)) & ((updated_at<"2025-03-07T10:34:13.058Z") | (updated_at="2025-03-07T10:34:13.058Z" & price<50) | (updated_at="2025-03-07T10:34:13.058Z" & price=50 & active<true)) & ((updated_at>"2025-03-07T10:34:13.058Z") | (updated_at="2025-03-07T10:34:13.058Z" & price>100) | (updated_at="2025-03-07T10:34:13.058Z" & price=100 & active>true))',
        vql: {
          '$and': [
            {
              '$or': [
                { '$not': { $search: 'a' } },
                { '$and': [ { $search: 'b' }, { $search: 'c' } ] }
              ]
            },
            {
              '$or': [
                { updated_at: { '$lt': '2025-03-07T10:34:13.058Z' } },
                {
                  '$and': [
                    { updated_at: { '$eq': '2025-03-07T10:34:13.058Z' } },
                    { price: { '$lt': 50 } }
                  ]
                },
                {
                  '$and': [
                    { updated_at: { '$eq': '2025-03-07T10:34:13.058Z' } },
                    { price: { '$eq': 50 } },
                    { active: { '$lt': true } }
                  ]
                }
              ]
            },
            {
              '$or': [
                { updated_at: { '$gt': '2025-03-07T10:34:13.058Z' } },
                {
                  '$and': [
                    { updated_at: { '$eq': '2025-03-07T10:34:13.058Z' } },
                    { price: { '$gt': 100 } }
                  ]
                },
                {
                  '$and': [
                    { updated_at: { '$eq': '2025-03-07T10:34:13.058Z' } },
                    { price: { '$eq': 100 } },
                    { active: { '$gt': true } }
                  ]
                }
              ]
            }
          ]
        }
      }
    },
  ];
  
  for(const c of cases) {
    const q_params = api_query_to_searchparams(c.input);
    const actual_output = parse_query(q_params);
    // console.log({case: c})
    // console.log({q_params})
    // console.dir({actual_output}, {depth: 15});

    assert_partial(
      actual_output,
      c.output
    );
  }
});


s('range_query_overrides_sort_cursor', async () => {
  /** @type {Tuple<string>[]} */
  const range_cursor = [['updated_at', '2012'], ['id', 'id_1']];

  /** @type {ApiQuery[]} */
  const cases = [
    {
      equals: range_cursor,
      sortBy: ['fake']
    },
    {
      startAt: range_cursor,
      sortBy: ['fake']
    },
    {
      startAfter: range_cursor,
      sortBy: ['fake']
    },
    {
      endAt: range_cursor,
      sortBy: ['fake']
    },
    {
      endBefore: range_cursor,
      sortBy: ['fake']
    },
  ];

  for(const c of cases) {
    const q_params = api_query_to_searchparams(c);
    const api_query = parse_query(q_params);
    assert.snapshot(
      JSON.stringify(api_query.sortBy),
      JSON.stringify(range_cursor.map(it => it[0]))
    );
  }
});

s('non_matching_range_cursor_keys_throw', async () => {
  /** @type {Tuple<string>[]} */
  const range_cursor = [['updated_at', '2012'], ['id', 'id_1']];

  /** @type {ApiQuery[]} */
  const cases = [
    {
      startAt: [['updated_at', '2012'], ['id', 'id_1']],
      endAt: [['updated_at', '2012'], ['x', 'id_1']]
    },
    {
      startAfter: [['updated_at', '2012'], ['id', 'id_1']],
      endBefore: [['updated_at', '2012'], ['x', 'id_1']]
    },
  ];
  
  for(const c of cases) {
    assert.throws(
      () => {
        const q_params = api_query_to_searchparams(c);
        const api_query = parse_query(q_params);
      }
    );
  }
});

s('setting_same_direction_range_cursor_throws', async () => {
  /** @type {Tuple<string>[]} */
  const range_cursor = [['updated_at', '2012'], ['id', 'id_1']];

  /** @type {ApiQuery[]} */
  const cases = [
    {
      startAt: [['updated_at', '2012'], ['id', 'id_1']],
      startAfter: [['updated_at', '2012'], ['x', 'id_1']]
    },
    {
      endAt: [['updated_at', '2012'], ['id', 'id_1']],
      endBefore: [['updated_at', '2012'], ['x', 'id_1']]
    },
  ];

  for(const c of cases) {
    assert.throws(
      () => {
        const q_params = api_query_to_searchparams(c);
        const api_query = parse_query(q_params);
      }
    );
  }
});

s.run();