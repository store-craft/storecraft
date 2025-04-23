import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { parse } from '../index.js';

test('parse 1', async () => {
  const truth = {
    op: '&',
    args: [
      { op: 'LEAF', value: 'name:tomer*' },
      {
        op: '|',
        args: [
          { op: 'LEAF', value: 'tag:genre_a' },
          { op: '!', args: [ { op: 'LEAF', value: 'tag:genre_b' } ] }
        ],
        group: true
      },
      { op: 'LEAF', value: '"combined text 1"' },
      { op: 'LEAF', value: 'name="tomer"' },
      { op: 'LEAF', value: "name2='tomer2'" }
    ]
  }

  const source = `(name:tomer* (tag:genre_a | -tag:genre_b) "combined text 1" name="tomer") name2='tomer2'`;
  const ast = parse(source);

  // console.dir({ast}, {depth: 15});

  assert.equal(ast, truth);
});


test.run();