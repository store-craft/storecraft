import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { parse_query } from '../utils.query.js'

const data = [
  {
    q: new URLSearchParams('?startAt=(updated_at:"2012", id:"0")&sortBy=(updated_at, id)&order=asc&limit=10'),
    expected: {
      "limit": 10,
      "startAt": [
        [ "updated_at", "2012" ],
        [ "id", "0" ]
      ],
      "sortBy": [ "updated_at", "id" ]
    }
  },
  {
    description: 'range cursor dictates sort and overrides it',
    q: new URLSearchParams('?startAt=(updated_at:"2012", id:"0")&sort=(created_at)'),
    expected: {
      "startAt": [
        [ "updated_at", "2012" ],
        [ "id", "0" ]
      ],
      "sortBy": [ "updated_at", "id" ]
    }
  },
  {
    description: 'range cursor dictates missing sort',
    q: new URLSearchParams('?startAt=(updated_at:"2012", id:"0")'),
    expected: {
      "startAt": [
        [ "updated_at", "2012" ],
        [ "id", "0" ]
      ],
      "sortBy": [ "updated_at", "id" ],
      "order": "desc"
    }
  },
  {
    description: 'boolean parsing',
    q: new URLSearchParams('?startAt=(active:true)'),
    expected: {
      "startAt": [
        [ "active", true ],
      ],
      "sortBy": [ "active"],
      "order": "desc"
    }
  },
  {
    description: 'numbers parsing',
    q: new URLSearchParams('?startAt=(price:50)'),
    expected: {
      "startAt": [
        [ "price", 50 ],
      ],
      "sortBy": [ "price"],
      "order": "desc"
    }
  },  
  {
    description: 'just sort',
    q: new URLSearchParams('?sortBy=(price, id)&order=asc'),
    expected: {
      "startAt": undefined,
      "sortBy": [ "price", "id" ],
      "order": "asc"
    }
  },
  {
    q: new URLSearchParams('?startAt=(updated_at:2012, id:0)&startAfter=(created_at:+)'),
    expected: undefined
  },
  {
    q: new URLSearchParams('?startAt=(updated_at:2012, id:0)&endAt=(created_at:+)'),
    expected: undefined
  },
]

test('parse queries', async () => {

  data.forEach(
    (d, ix) => {
      // console.log(`Example #${ix}`);
      let parsed = undefined;
      try {
        parsed = parse_query(d.q);
        // console.log(parsed);
        // console.log(d.expected);
        // console.log(JSON.stringify(parsed, function(k, v) { return v; }, 2));
      } catch(e) {
        // console.log(e)
      } finally {

        // If should fail
        if(d.expected===undefined) {
          assert.ok(parsed===undefined, 'parsing should have failed');
          return;
        }
        // otherwise, test expected keys against parsed keys
        Object.keys(d.expected).forEach(
          key => {
            assert.equal(parsed[key], d.expected[key], `didn't match key \`${key}\``);
          }
        );
      }
    }
  )
});

test.run();