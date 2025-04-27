import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { query_vql_to_mongo_filter } from '../src/utils.query.js'

//
// TODO:
// - [ ] Add tests for query_vql_to_mongo_filter
// although it is tested as a black box in the main test file
//
test('query_vql_to_mongo_filter', async () => {
  const vql_ast = {
  };

  const mongo = {
  };

  // const m1 = query_vql_to_mongo_filter(vql_ast);
  
  // console.log(JSON.stringify(m1, null, 2))

  // assert.equal(m1, mongo);
});

test.run();