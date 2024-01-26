import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { query_vql_to_mongo } from '../src/utils.query.js'

test('VQL', async () => {
  const vql_ast = {
    op: '&',
    args: [
      {
        op: 'LEAF',
        value: 'name:tomer'
      },
      {
        op: '&',
        args: [
          {
            op: 'LEAF',
            value: 'tag:genre_a'
          },
          {
            op: '!',
            args: [
              {
                op: 'LEAF',
                value: 'tag:genre_b'
              }
            ]
          }
        ],
        group: true
      }
    ],
    group: true
  };

  const mongo = {
    "$and": [
      {
        "search": "name:tomer"
      },
      {
        "$and": [
          {
            "search": "tag:genre_a"
          },
          {
            "$not": {
              "search": "tag:genre_b"
            }
          }
        ]
      }
    ]
  };

  const m1 = query_vql_to_mongo(vql_ast);
  
  console.log(JSON.stringify(m1, null, 2))

  assert.equal(m1, mongo);
});

test.run();