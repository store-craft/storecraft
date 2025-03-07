/** 
 * @import { ApiQuery, Tuple } from '../api/types.api.query.js';
 */
import 'dotenv/config';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { file_name } from '../test-runner/api/api.utils.crud.js';
import { 
  api_query_to_searchparams, EXPAND, is_string_a_number, parse_expand, 
  parse_list_from_string, parse_number_from_string, parse_query, 
  parse_sortby, parse_tuples, parse_tuples_old, parse_value_part 
} from './utils.query.js';
import { assert_partial } from '../test-runner/api/utils.js';
import { parse } from '../vql/index.js';


const s = suite(
  file_name(import.meta.url), 
);

s('is_string_a_number', async () => {
  const cases = {
    '4': true,
    '"4"': false,
    'abc': false,
  }
  for(const c in cases) {
    assert.ok(
      is_string_a_number(c)==cases[c], 'fail'
    );

  }
});

s('parse_value_part', async () => {
  const cases = {
    '4': 'number',
    '"4"': 'string',
    "'4'": 'string',
    "true": 'boolean',
    "false": 'boolean',
    'abc': 'string',
  }
  for(const c in cases) {
    assert.ok(
      (typeof parse_value_part(c))===cases[c], 'fail'
    );

  }
});

s('parse_tuples', async () => {
  const cases = {
    '(updated:2010-20-10,id:my-id)': [['updated', '2010-20-10'], ['id', 'my-id']],
    'updated:  2010-20-10 ,  id:  my-id': [['updated', '2010-20-10'], ['id', 'my-id']],
    'updated:2010-20-10|id:my-id': [['updated', '2010-20-10'], ['id', 'my-id']],
    'updated:"2010-20-10"|id:"my-id"': [['updated', '2010-20-10'], ['id', 'my-id']],
    'updated:"2010-20-10"|id:my-  id': [['updated', '2010-20-10'], ['id', 'my-  id']],
  }
  for(const c in cases) {
    assert.snapshot(
      JSON.stringify(parse_tuples(c)),
      JSON.stringify(cases[c])
    );

  }
});

s('parse_list_from_string', async () => {
  const cases = [
    {
      value: 'a,b,c',
      expected: ['a','b','c']
    },
    {
      value: '(a,b,c)',
      expected: ['a','b','c']
    },
    {
      value: '[a d|b|c]',
      expected: ['a d','b','c']
    },
  ]
  for(const c of cases) {
    assert.snapshot(
      JSON.stringify(parse_list_from_string(c.value)),
      JSON.stringify(c.expected)
    );
  }
});

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
      value: 'a,b,c',
      expected: ['a','b','c']
    },
    {
      value: '(a,b,c)',
      expected: ['a','b','c']
    },
    {
      value: '[a d|b|c]',
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

s('parse_number_from_string', async () => {
  const cases = [
    {
      value: ' 5 ',
      expected: 5
    },
    {
      value: '5',
      expected: 5
    },
    {
      value: '"5"',
      expected: Number.NaN
    },
    {
      value: 'abc',
      expected: Number.NaN
    },
  ]
  for(const c of cases) {
    assert.equal(
      parse_number_from_string(c.value),
      c.expected
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
      vql: '-a | (b & c)'
    },
    {
      endBefore: [['updated_at', '"2025-03-07T10:34:13.058Z"'], ['price', 100], ['active', true]],
      sortBy: ['updated_at', 'price', 'active'],
      expand: ['products'],
      limitToLast: 10,
      order: 'desc',
      startAfter: [['updated_at', '"2025-03-07T10:34:13.058Z"'], ['price', 50], ['active', true]],
      vql: '-a | (b & c)'
    },
  ];

  for(const c of cases) {
    const q_params = api_query_to_searchparams(c);
    const api_query = parse_query(q_params);

    assert_partial(
      api_query,
      c
    );
  }
});

s('parse_query_also_parses_VQL', async () => {
  /** @type {ApiQuery[]} */
  const cases = [
    {
      vql: '-a | (b & c)'
    },
  ];

  for(const c of cases) {
    const q_params = api_query_to_searchparams(c);
    const api_query = parse_query(q_params);
    assert.snapshot(
      JSON.stringify(api_query.vqlParsed),
      JSON.stringify(parse(c.vql))
    );
  }
});

s('api_query_equals_maps_to_start_and_end', async () => {
  /** @type {ApiQuery[]} */
  const cases = [
    {
      equals: [['updated_at', '2012'], ['id', 'id_1']]
    },
  ];

  for(const c of cases) {
    const q_params = api_query_to_searchparams(c);
    const api_query = parse_query(q_params);
    assert.snapshot(
      JSON.stringify(api_query.startAt),
      JSON.stringify(api_query.endAt)
    );
    assert.snapshot(
      JSON.stringify(api_query.startAt),
      JSON.stringify(c.equals)
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