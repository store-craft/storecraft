/** 
 * @import { VQL, VQL_OPS } from './types.js';
 */
import 'dotenv/config';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { file_name } from '../test-runner/api/api.utils.file.js';
import { compile, parse } from './index.js';
import { reduce_vql, test_vql_against_object } from './utils.js';


const s = suite(
  file_name(import.meta.url), 
);

s('reduce_vql helper', async () => {

  /** @type {VQL<{a: number, b: number, c: string}>} */
  const vql = parse('a>=5 & a<=10 & -(b>5) tomer c~jj');

  console.dir({vql}, {depth: 10});

  const search = ['tomer']
  const o = {
    a: 5,
    b: 4,
    c: 'jjk'
  }

  const result = test_vql_against_object(
    vql,
    o,
    search,
    false
  );

  assert.ok(result, 'test_vql_against_object failed');


});


s.run();