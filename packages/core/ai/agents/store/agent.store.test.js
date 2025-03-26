import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { sanitize_search } from './agent.tools.js'

test(
  'sanitize_search',
  () => {
    assert.equal(
      sanitize_search(
        [
          {
            a: {
              search: 1
            },
            b: {
              c: [
                {
                  search: 1
                }
              ]
            }
          }
        ]
      ),
      [
        {
          a: {
          },
          b: {
            c: [
              {
              }
            ]
          }
        }
      ]
    )
  }
);

test.run();