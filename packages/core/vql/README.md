# VQL - Virtual Query Language

**VQL** helps you transform this:

```js
((tag:subscribed & age>=18 & age<35) | active=true)
```
Into this:

```js
{
  '$or': [
    {
      '$and': [
        { $search: 'subscribed' },
        { age: { '$gte': 18 } },
        { age: { '$lt': 35 } }
      ]
    },
    { active: { '$eq': true } }
  ]
}
```
And this:

```js
((name~'mario 2' & age>=18 -age<35) | active=true) 
```
Into this:

```js
{ 
  '$or': [
    {
      $and: [
        { name: { $like: 'mario 2' } },
        { age: { $gte: 18 } },
        { $not: { age: { $lt: 35 } } }
      ]
    },
    { active: { '$eq': true } }
  ]
}
```

`VQL` is both a typed data structure and a query language. 
It is designed to be used with the `vql` package, which provides 
a parser and an interpreter for the language.

It is a simple and powerful way to query data structures, 
allowing you to express complex queries in a concise and readable format.

## Features

- **HTTP Query friendly** : The language is designed to be used with HTTP queries, making it easy to integrate with REST APIs and other web services.
- **Flexible**: The language allows you to express complex queries using a simple syntax.
- **Readable**: The syntax is designed to be easy to read and understand, making it accessible to developers of all skill levels.
- **Fully Typed**: The `vql` package provides full type support for the language, allowing you to define and query data structures with confidence.

```ts
type Data = {
  id: string
  name: string
  age: number
  active: boolean
  created_at: string
}

const query: VQL<Data> = {
  search: 'tag:subscribed',
  $and: [
    {
      age: {
        $gte: 18,
        $lt: 35,
      },
    },
    {
      active: {
        $eq: true,
      }
    }
  ],
}
```

## Syntax

The syntax of `vql` is designed to be simple and intuitive. It uses a combination of logical operators (`$and`, `$or`, `$not`) and comparison operators (`$eq`, `$ne`, `$gt`, `$lt`, `$gte`, `$lte`, `$like`) to express queries.

You can compile and parse a query to string using the `compile` and `parse` functions provided by the `vql` package.


The following expression

```js
((updated_at>='2023-01-01' & updated_at<='2023-12-31') | age>=20 | active=true)
```

Will parse into (using the `parse` function)

```js
import { parse } from '.';

const query = '((updated_at>="2023-01-01" & updated_at<="2023-12-31") | age>=20 | active=true)'
const parsed = parse(query)

console.log(parsed)
```

The output will be:

```js
{
  '$or': [
    {
      '$and': [
        { updated_at: { '$gte': '2023-01-01' } },
        { updated_at: { '$lte': '2023-12-31' } }
      ]
    },
    { age: { '$gte': 20 } },
    { active: { '$eq': true } }
  ]
}
```

You can also use the `compile` function to convert the parsed query back into a string representation.  

```js
import { compile } from '.';

const query = {
  '$or': [
    {
      '$and': [
        { updated_at: { '$gte': '2023-01-01' } },
        { updated_at: { '$lte': '2023-12-31' } }
      ]
    },
    { age: { '$gte': 20 } },
    { active: { '$eq': true } }
  ]
}

const compiled = compile(query);

console.log(compiled);
// ((updated_at>='2023-01-01' & updated_at<='2023-12-31') | age>=20 | active=true)
```

## Details

You can use the following mapping to convert the operators to their string representation:
```js
{
  '>': '$gt',
  '>=': '$gte',

  '<': '$lt',
  '<=': '$lte',

  '=': '$eq',
  '!=': '$ne',

  '~': '$like',

  '&': '$and',
  '|': '$or',
  '-': '$not',
};
```

Notes:
- Using the `&` sign is optional.
- The `$in` and `$nin` operators are not supported yet in the string query.
Just use them in the object query.

