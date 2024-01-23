import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { parse } from '../index.js';

test('parse 1', async () => {
  const truth = {
        "op": "&",
        "args": [
          "name:tomer*",
          {
            "op": "&",
            "args": [
              "tag:genre_a",
              {
                "op": "!",
                "args": "tag:genre_b"
              }
            ],
            "group": true
          }
        ],
        "group": true
      };
  
  

  const source = '(name:tomer* (tag:genre_a -tag:genre_b))';
  const ast = parse(source);

  assert.equal(ast, truth);
});


test.run();