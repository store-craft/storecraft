/** 
 * @import { ApiQuery, Tuple } from '../api/types.api.query.js';
 */
import 'dotenv/config';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { file_name } from '../test-runner/api/api.utils.crud.js';
import { assert_partial } from '../test-runner/api/utils.js';
import { compile, parse } from './index.js';
import { is_string_a_number, parse_string_as_type } from './parse.utils.js';
import { string_arg_to_typed_arg } from './parse.js';


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

s('parse_string_as_type', async () => {
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
      (typeof parse_string_as_type(c))===cases[c], 'fail'
    );

  }
});


s('string_arg_to_typed_arg', async () => {
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
      (typeof string_arg_to_typed_arg(c))===cases[c], 'fail'
    );

  }
});

s('parse $eq $neq $like', async () => {
  const vql_boolean = '(a1=true | a2!=false | a3~true | -a4=true | term1)';
  const vql_number = '(b1=1 | b2!=2 | b3~3 | -b4=4 | "term2 combined")';
  const vql_string = '(c1=tomer | c2!=tomer2 | c3~tomer3 | -c4="tomer 4" | tomer5)';
  const vql_eq = '(' + [
    vql_boolean,
    vql_number,
    vql_string
  ].join(' & ') + ')';

  // console.log('vql_eq', vql_eq);
  // console.dir(parse(vql_eq), {depth: 10});
  // console.dir(parse(vql_eq), {depth: 10});

  assert.equal(
    compile(parse(vql_eq)), 
    vql_eq
  );

});


s('parse $lt $lte $gt $gte', async () => {
  const vql_boolean = '(a1<true | a2<=false | a3>true | a4>=false | -a5<true | term1)';
  const vql_number = '(b1<1 | b2<=2 | b3>3 | b4>=4 | -b5>=5 | "term2 combined")';
  const vql_string = '(c1<tomer1 | c2<=tomer2 | c3>tomer3 | c4>=tomer4 | c4>=tomer4 | -c5>=tomer5 | tomer6)';
  const vql_eq = '(' + [
    vql_boolean,
    vql_number,
    vql_string
  ].join(' & ') + ')';

  // const vql = parse(vql_eq);
  // console.log(JSON.stringify(vql, null, 2))
  // console.log(compile(parse(vql_eq)));

  assert.equal(
    compile(parse(vql_eq)), 
    vql_eq
  );

});


s.run();