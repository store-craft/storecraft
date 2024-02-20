# VQL - Virtual Query Language
`vql` is a PEG language of boolean logic / membership

The following expression
```js
(name:tomer* | -(tag:genre_a -tag:genre_b) | "very long with weird chars | ")
```

Will parse into **AST**
```js

{
  op: '|',
  args: [
    {
      op: 'LEAF',
      value: 'name:tomer*'
    },
    {
      op: '!',
      args: [
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
      ]
    },
    {
      op: 'LEAF',
      value: 'very long with weird chars | '
    }
  ],
  group: true
}

```

### How to compile
Simply, `node ./compile.js`, which will generate `./index.js` **ES Module**,
which you can use like so:
```js
import { parse } from './index.js';

const AST = parse('(name:tomer* -(tag:genre_a -tag:genre_b))')
```

### playground
copy `vql.pegjs` into the online [https://peggyjs.org/online.html](https://peggyjs.org/online.html)