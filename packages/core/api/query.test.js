/** 
 * @import { ApiQuery, Tuple } from '../api/types.api.query.js';
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
import { assert_partial } from '../test-runner/api/utils.js';
import { parse } from '../vql/bool-ql/index.js';


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
  /** @type {ApiQuery[]} */
  const cases = [
    {
      endAt: [['updated_at', '2025-03-07T10:34:13.058Z'], ['price', 100], ['active', true]],
      expand: ['products'],
      limit: 10,
      order: 'asc',
      sortBy: ['updated_at', 'price', 'active'],
      startAt: [['updated_at', '"2025-03-07T10:34:13.058Z"'], ['price', 50], ['active', true]],
      vql_as_string: '-a | (b & c)'
    },
    // {
    //   endBefore: [['updated_at', '"2025-03-07T10:34:13.058Z"'], ['price', 100], ['active', true]],
    //   sortBy: ['updated_at', 'price', 'active'],
    //   expand: ['products'],
    //   limitToLast: 10,
    //   order: 'desc',
    //   startAfter: [['updated_at', '"2025-03-07T10:34:13.058Z"'], ['price', 50], ['active', true]],
    //   vql: '-a | (b & c)'
    // },
  ];

  
  for(const c of cases) {
    const q_params = api_query_to_searchparams(c);
    const api_query = parse_query(q_params);
    console.log(c)
    console.log(q_params)
    console.log(api_query)

    assert_partial(
      api_query,
      c
    );
  }
});


// s('parse_query_also_parses_VQL', async () => {
//   /** @type {ApiQuery[]} */
//   const cases = [
//     {
//       vql: '-a | (b & c)'
//     },
//   ];

//   for(const c of cases) {
//     const q_params = api_query_to_searchparams(c);
//     const api_query = parse_query(q_params);
//     assert.snapshot(
//       JSON.stringify(api_query.vqlParsed),
//       JSON.stringify(parse(c.vql))
//     );
//   }
// });

// s('api_query_equals_maps_to_start_and_end', async () => {
//   /** @type {ApiQuery[]} */
//   const cases = [
//     {
//       equals: [['updated_at', '2012'], ['id', 'id_1']]
//     },
//   ];

//   for(const c of cases) {
//     const q_params = api_query_to_searchparams(c);
//     const api_query = parse_query(q_params);
//     assert.snapshot(
//       JSON.stringify(api_query.startAt),
//       JSON.stringify(api_query.endAt)
//     );
//     assert.snapshot(
//       JSON.stringify(api_query.startAt),
//       JSON.stringify(c.equals)
//     );
//   }
// });

// s('range_query_overrides_sort_cursor', async () => {
//   /** @type {Tuple<string>[]} */
//   const range_cursor = [['updated_at', '2012'], ['id', 'id_1']];

//   /** @type {ApiQuery[]} */
//   const cases = [
//     {
//       equals: range_cursor,
//       sortBy: ['fake']
//     },
//     {
//       startAt: range_cursor,
//       sortBy: ['fake']
//     },
//     {
//       startAfter: range_cursor,
//       sortBy: ['fake']
//     },
//     {
//       endAt: range_cursor,
//       sortBy: ['fake']
//     },
//     {
//       endBefore: range_cursor,
//       sortBy: ['fake']
//     },
//   ];

//   for(const c of cases) {
//     const q_params = api_query_to_searchparams(c);
//     const api_query = parse_query(q_params);
//     assert.snapshot(
//       JSON.stringify(api_query.sortBy),
//       JSON.stringify(range_cursor.map(it => it[0]))
//     );
//   }
// });

// s('non_matching_range_cursor_keys_throw', async () => {
//   /** @type {Tuple<string>[]} */
//   const range_cursor = [['updated_at', '2012'], ['id', 'id_1']];

//   /** @type {ApiQuery[]} */
//   const cases = [
//     {
//       startAt: [['updated_at', '2012'], ['id', 'id_1']],
//       endAt: [['updated_at', '2012'], ['x', 'id_1']]
//     },
//     {
//       startAfter: [['updated_at', '2012'], ['id', 'id_1']],
//       endBefore: [['updated_at', '2012'], ['x', 'id_1']]
//     },
//   ];
  
//   for(const c of cases) {
//     assert.throws(
//       () => {
//         const q_params = api_query_to_searchparams(c);
//         const api_query = parse_query(q_params);
//       }
//     );
//   }
// });

// s('setting_same_direction_range_cursor_throws', async () => {
//   /** @type {Tuple<string>[]} */
//   const range_cursor = [['updated_at', '2012'], ['id', 'id_1']];

//   /** @type {ApiQuery[]} */
//   const cases = [
//     {
//       startAt: [['updated_at', '2012'], ['id', 'id_1']],
//       startAfter: [['updated_at', '2012'], ['x', 'id_1']]
//     },
//     {
//       endAt: [['updated_at', '2012'], ['id', 'id_1']],
//       endBefore: [['updated_at', '2012'], ['x', 'id_1']]
//     },
//   ];

//   for(const c of cases) {
//     assert.throws(
//       () => {
//         const q_params = api_query_to_searchparams(c);
//         const api_query = parse_query(q_params);
//       }
//     );
//   }
// });

s.run();