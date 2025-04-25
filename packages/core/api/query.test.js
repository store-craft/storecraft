/** 
 * @import { ApiQuery, Tuple } from '../api/types.api.query.js';
 * @import { BaseType } from './types.api.js';
 */
import 'dotenv/config';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { file_name } from '../test-runner/api/api.utils.file.js';
import { 
  api_query_to_searchparams, EXPAND, parse_expand, 
  parse_query, parse_sortby,
  SORT_BY
} from './query.js';
import { assert_partial } from '../test-runner/api/api.utils.js';

const s = suite(
  file_name(import.meta.url), 
);

s('parse_expand', async () => {
  new URLSearchParams({ [EXPAND]: 'a,b,c' })
  const cases = [
    {
      url: new URLSearchParams({ [EXPAND]: 'a,b,c' }),
      expected: ['a','b','c']
    },
    {
      url: new URLSearchParams({ [EXPAND]: '(a,b,c)' }),
      expected: ['a','b','c']
    },
    {
      url: new URLSearchParams({ [EXPAND]: '[a d|b|c]' }),
      expected: ['a d','b','c']
    },
    {
      url: new URLSearchParams(),
      expected: ['*']
    },
  ]
  for(const c of cases) {
    assert.snapshot(
      JSON.stringify(parse_expand(c.url)),
      JSON.stringify(c.expected)
    );

  }
});

s('parse_sortby', async () => {
  const cases = [
    {
      value: new URLSearchParams({[SORT_BY]: 'a,b,c'}),
      expected: ['a','b','c']
    },
    {
      value: new URLSearchParams({[SORT_BY]: '(a,b,c)'}),
      expected: ['a','b','c']
    },
    {
      value: new URLSearchParams({[SORT_BY]: '[a d|b|c]'}),
      expected: ['a d','b','c']
    },
  ]
  for(const c of cases) {
    assert.snapshot(
      JSON.stringify(parse_sortby(c.value)),
      JSON.stringify(c.expected)
    );
  }
});

s('api_query_to_url_query_params_and_back', async () => {
  /** @type {ApiQuery<BaseType & {price: number, products: {}[], collections: {}[]}>[]} */
  const cases = [
    {
      expand: ['products'],
      limit: 10,
      order: 'asc',
      sortBy: ['updated_at', 'price', 'active'],
      vql_as_string: '-a | (b & c)'
    },
    {
      expand: ['products', 'collections'],
      limit: 10,
      order: 'asc',
      sortBy: ['updated_at', 'price', 'active'],
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
  ];
  
  for(const c of cases) {
    const q_params = api_query_to_searchparams(c);
    const api_query = parse_query(q_params);

    // console.log({case: c})
    // console.log({q_params})
    // console.dir({api_query}, {depth: 15});

    assert_partial(
      api_query,
      c
    );
  }
});


s.run();