# VQL - Virtual Query Language
`vql` uses bool-ql to parse a query string into an AST (Abstract Syntax Tree)
of query filters.

The following expression
```js
((a1=true | a2!=false | a3~true | -a4=true | term1) & (b1=1 | b2!=2 | b3~3 | -b4=4 | "term2 combined") & (c1=tomer | c2!=tomer2 | c3~tomer3 | -c4=tomer4 | tomer5))
```

Will parse into **AST**
```js
{
  '$and': [
    {
      '$or': [
        { a1: { '$eq': true } },
        { a2: { '$ne': false } },
        { a3: { '$like': 'true' } },
        { '$not': { a4: { '$eq': true } } },
        { search: 'term1' }
      ]
    },
    {
      '$or': [
        { b1: { '$eq': 1 } },
        { b2: { '$ne': 2 } },
        { b3: { '$like': '3' } },
        { '$not': { b4: { '$eq': 4 } } },
        { search: 'term2 combined' }
      ]
    },
    {
      '$or': [
        { c1: { '$eq': 'tomer' } },
        { c2: { '$ne': 'tomer2' } },
        { c3: { '$like': 'tomer3' } },
        { '$not': { c4: { '$eq': 'tomer4' } } },
        { search: 'tomer5' }
      ]
    }
  ]
}
```
