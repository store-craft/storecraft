/** 
 */
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { file_name } from '../test-runner/api/api.utils.file.js';
import { 
  is_string_a_number, parse_list_from_string, 
  parse_number_from_string, parse_tuples, 
  parse_value_part 
} from './query.utils.js';


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

s.run();