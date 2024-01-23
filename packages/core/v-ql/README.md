# VQL - Virtual Query Language
`vql` is a PEG language of boolean logic / membership

The following expression
```js
(name:tomer* -(tag:genre_a -tag:genre_b))
```

Will parse into **AST**
```js
{
  op: '&',
  args: [
    'name:tomer*',
    {
      op: '!',
      args: {
        op: '&',
        args: [
          'tag:genre_a',
          {
            op: '!',
            args: 'tag:genre_b'
          }
        ],
        group: true
      }
    }
  ],
  group: true
}
3

```

### How to compile
Simply, `node ./compile.js`, which will generate `./index.js` **ES Module**,
which you can use like so:
```js
import { parse } from './index.js';

const AST = parse('(name:tomer* -(tag:genre_a -tag:genre_b))')
```