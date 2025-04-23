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
      { op: 'LEAF', value: "name2='tomer and tomer'", group: true }
    ]
  }

  const source = `(name:tomer* (tag:genre_a | -tag:genre_b) "combined text 1" name="tomer") & (name2='tomer and tomer')`;
  const ast = parse(source);

  // console.dir({ast}, {depth: 15});

  assert.equal(ast, truth);
});


test('parse 2', async () => {
  const truth = {
    op: '&',
    args: [
      {
        op: '|',
        args: [
          { op: '!', args: [ { op: 'LEAF', value: 'a' } ] },
          {
            op: '&',
            args: [ { op: 'LEAF', value: 'b' }, { op: 'LEAF', value: 'c' } ],
            group: true
          }
        ],
        group: true
      },
      {
        op: '|',
        args: [
          {
            op: 'LEAF',
            value: 'updated_at>"2025-03-07T10:34:13.058Z"',
            group: true
          },
          {
            op: '&',
            args: [
              {
                op: 'LEAF',
                value: 'updated_at="2025-03-07T10:34:13.058Z"'
              },
              { op: 'LEAF', value: 'price>50' }
            ],
            group: true
          },
          {
            op: '&',
            args: [
              {
                op: 'LEAF',
                value: 'updated_at="2025-03-07T10:34:13.058Z"'
              },
              { op: 'LEAF', value: 'price=50' },
              { op: 'LEAF', value: 'active>=true' }
            ],
            group: true
          }
        ],
        group: true
      },
      {
        op: '|',
        args: [
          {
            op: 'LEAF',
            value: 'updated_at<2025-03-07T10:34:13.058Z',
            group: true
          },
          {
            op: '&',
            args: [
              {
                op: 'LEAF',
                value: 'updated_at=2025-03-07T10:34:13.058Z'
              },
              { op: 'LEAF', value: 'price<100' }
            ],
            group: true
          },
          {
            op: '&',
            args: [
              {
                op: 'LEAF',
                value: 'updated_at=2025-03-07T10:34:13.058Z'
              },
              { op: 'LEAF', value: 'price=100' },
              { op: 'LEAF', value: 'active<=true' }
            ],
            group: true
          }
        ],
        group: true
      }
    ]
  }

  const source = `(-a | (b & c)) & ((updated_at>"2025-03-07T10:34:13.058Z") | (updated_at="2025-03-07T10:34:13.058Z" & price>50) | (updated_at="2025-03-07T10:34:13.058Z" & price=50 & active>=true)) & ((updated_at<2025-03-07T10:34:13.058Z) | (updated_at=2025-03-07T10:34:13.058Z & price<100) | (updated_at=2025-03-07T10:34:13.058Z & price=100 & active<=true))`;
  const ast = parse(source);

  // console.dir({ast}, {depth: 15});

  assert.equal(ast, truth);
});


test.run();