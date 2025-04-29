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

s('test_vql_against_object->reduce_vql 1', async () => {

  const o = {
    a: 5,
    b: 4,
    c: 'jjkkk'
  }

  /** @type {VQL<typeof o>} */
  const vql = parse('a>=5 & a<=10 & -(b>5) tomer c~jj');

  // console.dir({vql}, {depth: 10});

  const search = ['tomer']

  const result = test_vql_against_object(
    vql,
    o,
    search,
    false
  );

  assert.ok(result, 'test_vql_against_object failed');
});

s('test_vql_against_object->reduce_vql 2', async () => {

  const o = {
    a: 5,
    b: 4,
    c: 'jjkkk'
  }

  /** @type {VQL<typeof o>} */
  const vql = {
    a: {
      $eq: 5
    },
    $and: [
      {
        $and: [
          {
            $not: {
              b: {$eq: 3}
            }
          }
        ]
      },
      {
        $or: [
          {
            c: {
              $like: 'jjk'
            }
          }
        ]
      }
    ]
  }

  // console.dir({vql}, {depth: 10});

  const search = ['tomer']

  const result = test_vql_against_object(
    vql,
    o,
    search,
    false
  );

  if(!result) {
    console.dir({vql}, {depth: 10});
    console.dir({o}, {depth: 10});
    test_vql_against_object(
      vql,
      o,
      search,
      true
    )
    assert.unreachable('test_vql_against_object failed');
  }

});


s.run();