import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { parse } from '../index.js';

test('parse 1', async () => {
  const truth = {
    op: '&',
    args: [
      {
        op: 'LEAF',
        value: 'name:tomer*'
      },
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
  };

  const source = '(name:tomer* (tag:genre_a -tag:genre_b))';
  const ast = parse(source);

  assert.equal(ast, truth);
});


test.run();