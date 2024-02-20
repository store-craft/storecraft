import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { query_cursor_to_mongo } from '../src/utils.query.js'

test('(a1, a2, a3)', async () => {
  const t_1 = {
    "$or": [
      {
        "$and": [
          {
            "a1": {
              "$gt": "b1"
            }
          }
        ]
      },
      {
        "$and": [
          {
            "a1": "b1"
          },
          {
            "a2": {
              "$gt": "b2"
            }
          }
        ]
      },
      {
        "$and": [
          {
            "a1": "b1"
          },
          {
            "a2": "b2"
          },
          {
            "a3": {
              "$gte": "b3"
            }
          }
        ]
      }
    ]
  };

  const t_2 = {
    "$or": [
      {
        "$and": [
          {
            "a1": {
              "$gt": "b1"
            }
          }
        ]
      },
      {
        "$and": [
          {
            "a1": "b1"
          },
          {
            "a2": {
              "$gt": "b2"
            }
          }
        ]
      },
      {
        "$and": [
          {
            "a1": "b1"
          },
          {
            "a2": "b2"
          },
          {
            "a3": {
              "$gt": "b3"
            }
          }
        ]
      }
    ]
  };

  const t_3 = {
    "$or": [
      {
        "$and": [
          {
            "a1": {
              "$lt": "b1"
            }
          }
        ]
      },
      {
        "$and": [
          {
            "a1": "b1"
          },
          {
            "a2": {
              "$lt": "b2"
            }
          }
        ]
      },
      {
        "$and": [
          {
            "a1": "b1"
          },
          {
            "a2": "b2"
          },
          {
            "a3": {
              "$lte": "b3"
            }
          }
        ]
      }
    ]
  };

  const t_4 = {
    "$or": [
      {
        "$and": [
          {
            "a1": {
              "$lt": "b1"
            }
          }
        ]
      },
      {
        "$and": [
          {
            "a1": "b1"
          },
          {
            "a2": {
              "$lt": "b2"
            }
          }
        ]
      },
      {
        "$and": [
          {
            "a1": "b1"
          },
          {
            "a2": "b2"
          },
          {
            "a3": {
              "$lt": "b3"
            }
          }
        ]
      }
    ]
  };

  /** @type {import('@storecraft/core').Cursor[]} */
  const cursor = [
    ['a1', 'b1'],
    ['a2', 'b2'],
    ['a3', 'b3'],
  ];

  const rel_1 = query_cursor_to_mongo(cursor, '>=');
  const rel_2 = query_cursor_to_mongo(cursor, '>');
  const rel_3 = query_cursor_to_mongo(cursor, '<=');
  const rel_4 = query_cursor_to_mongo(cursor, '<');

  assert.equal(rel_1, t_1);
  assert.equal(rel_2, t_2);
  assert.equal(rel_3, t_3);
  assert.equal(rel_4, t_4);

});


test('(a1, a2)', async () => {
  const t_1 = {
    "$or": [
      {
        "$and": [
          {
            "a1": {
              "$gt": "b1"
            }
          }
        ]
      },
      {
        "$and": [
          {
            "a1": "b1"
          },
          {
            "a2": {
              "$gte": "b2"
            }
          }
        ]
      },
    ]
  };

  const t_2 = {
    "$or": [
      {
        "$and": [
          {
            "a1": {
              "$gt": "b1"
            }
          }
        ]
      },
      {
        "$and": [
          {
            "a1": "b1"
          },
          {
            "a2": {
              "$gt": "b2"
            }
          }
        ]
      },
    ]
  };

  const t_3 = {
    "$or": [
      {
        "$and": [
          {
            "a1": {
              "$lt": "b1"
            }
          }
        ]
      },
      {
        "$and": [
          {
            "a1": "b1"
          },
          {
            "a2": {
              "$lte": "b2"
            }
          }
        ]
      },
    ]
  };

  const t_4 = {
    "$or": [
      {
        "$and": [
          {
            "a1": {
              "$lt": "b1"
            }
          }
        ]
      },
      {
        "$and": [
          {
            "a1": "b1"
          },
          {
            "a2": {
              "$lt": "b2"
            }
          }
        ]
      },
    ]
  };

  /** @type {import('@storecraft/core').Cursor[]} */
  const cursor = [
    ['a1', 'b1'],
    ['a2', 'b2'],
  ];

  const rel_1 = query_cursor_to_mongo(cursor, '>=');
  const rel_2 = query_cursor_to_mongo(cursor, '>');
  const rel_3 = query_cursor_to_mongo(cursor, '<=');
  const rel_4 = query_cursor_to_mongo(cursor, '<');
  
  assert.equal(rel_1, t_1);
  assert.equal(rel_2, t_2);
  assert.equal(rel_3, t_3);
  assert.equal(rel_4, t_4);
});



test('(a1)', async () => {
  const t_1 = {
    "$or": [
      {
        "$and": [
          {
            "a1": {
              "$gte": "b1"
            }
          }
        ]
      },
    ]
  };

  const t_2 = {
    "$or": [
      {
        "$and": [
          {
            "a1": {
              "$gt": "b1"
            }
          }
        ]
      },
    ]
  };

  const t_3 = {
    "$or": [
      {
        "$and": [
          {
            "a1": {
              "$lte": "b1"
            }
          }
        ]
      },
    ]
  };

  const t_4 = {
    "$or": [
      {
        "$and": [
          {
            "a1": {
              "$lt": "b1"
            }
          }
        ]
      },
    ]
  };

  /** @type {import('@storecraft/core').Cursor[]} */
  const cursor = [
    ['a1', 'b1'],
  ];

  const rel_1 = query_cursor_to_mongo(cursor, '>=');
  const rel_2 = query_cursor_to_mongo(cursor, '>');
  const rel_3 = query_cursor_to_mongo(cursor, '<=');
  const rel_4 = query_cursor_to_mongo(cursor, '<');
  
  assert.equal(rel_1, t_1);
  assert.equal(rel_2, t_2);
  assert.equal(rel_3, t_3);
  assert.equal(rel_4, t_4);
});



test.run();