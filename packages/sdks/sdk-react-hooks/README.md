# **Storecraft** Official React Hooks

<div style="text-align:center">
  <img src='https://storecraft.app/storecraft-color.svg' 
       width='90%' />
</div><hr/><br/>

Official **React** hooks for storecraft's javascript `SDK`.
Many hooks manage the state into the browser `LocalStorage` and even a cache
hook for `IndexDB`. All hooks have types and documentation.

Start by installing the package:

```bash
npm i @storecraft/sdk-react-hooks
```

Some of the useful hooks are:

## `useStorecraft()`

Gain access into the **SDK**, you can initialize with sdk config or you can
defer it and use the `updateConfig` callback. Either way, the config will be saved
locally with `LocalStorage` at the browser.

```js

import { useStorecraftSDK } from '@storecraft/sdk-react-hooks'

const {
  config,
  sdk, 
  isAuthenticated, 
  error,
  actions: {
    updateConfig
  }
} = useStorecraftSDK(config)

```


## `useAuth()`

Gain access and subscribe to `authentication` updates

```js

import { useAuth } from '@storecraft/sdk-react-hooks'

const {
  auth,
  isAuthenticated,
  actions: {
    signin, 
    signup, 
    signout
  }
} = useAuth();

```

## `useDocument()`

Fetch / Mutate a single document by `id` or `handle`

```js

import { useDocument } from '@storecraft/sdk-react-hooks'

const {
  doc, 
  sdk,
  loading, 
  hasLoaded, 
  error, 
  op, 
  resource,
  document,
  actions: { 
    reload, upsert, remove, setError,
  }
} = useDocument(
  'products', 
  'product_id_or_handle', 
  autoLoad=true, 
  try_cache_on_autoload=true
);

```

## `useCollection()`

Query collection of documents with pagination

```js

import { useCollection } from '@storecraft/sdk-react-hooks'

const {
  pages, 
  page,
  loading, 
  error, 
  sdk,
  queryCount, 
  resource,
  actions: {
    prev, 
    next, 
    query,
    poll, 
    removeDocument
  },
} = useCollection(
  'products', 
  { // optional initial query
    order: 'desc',
    sortBy: ['updated_at', 'id'],
    vql: {
      updated_at: {
        $gte: '2024-03-24',
      },
      active: true,
      $or: [
        { $search: 'tag:genre_action' },
        { $search: 'tag:genre_sports' },
      ],
    },
    limit: 10,
  },
  autoLoad=true, 
);

```

```text
Author: Tomer Shalev (tomer.shalev@gmail.com)
```