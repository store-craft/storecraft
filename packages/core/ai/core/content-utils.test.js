/**
 * @import { content, GenerateTextResponse } from './types.private.js'
 */
import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { reduce_text_deltas_into_text } from './content-utils.js';

test('reduce_content_deltas_into_text', () => {

  /** @type {content[]} */
  const contents = [
    {
      type: 'delta_text',
      content: 'Hello '
    },
    {
      type: 'delta_text',
      content: 'World '
    },
    {
      type: 'delta_text',
      content: '!'
    }
  ];

  const result = reduce_text_deltas_into_text(contents);

  // console.dir(result, { depth: 10 });

  assert.equal(result[0].content, 'Hello World !');
});


test('reduce_content_deltas_into_text with empty array', () => {
  /** @type {content[]} */
  const contents = [];

  const result = reduce_text_deltas_into_text(contents);

  assert.equal(result, []);
});

test('reduce_content_deltas_into_text with mixed content', () => {
  /** @type {content[]} */
  const contents = [
    {
      type: 'image',
      content: 'http://example.com/image1.png'
    },
    {
      type: 'delta_text',
      content: 'a1'
    },
    {
      type: 'delta_text',
      content: 'b1'
    },
    {
      type: 'delta_text',
      content: 'c1'
    },
    {
      type: 'image',
      content: 'http://example.com/image2.png'
    },
    {
      type: 'delta_text',
      content: 'a2'
    },
    {
      type: 'delta_text',
      content: 'b2'
    },
    {
      type: 'delta_text',
      content: 'c2'
    },    
  ];

  const result = reduce_text_deltas_into_text(contents);

  // console.dir(result, { depth: 10 });
  
  assert.equal(
    result, 
    [
      { type: 'image', content: 'http://example.com/image1.png' },
      { type: 'text', content: 'a1b1c1' },
      { type: 'image', content: 'http://example.com/image2.png' },
      { type: 'text', content: 'a2b2c2' },
    ]
  );
});


test.run();