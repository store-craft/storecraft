# **Storecraft** Official React Hooks

<div style="text-align:center">
  <img src='https://storecraft.app/storecraft-color.svg' 
       height='150px' />
</div><hr/><br/>

Official **React** hooks for storecraft's javascript `SDK`.
Many hooks manage the state into the browser `LocalStorage` and even a cache
hook for `IndexDB`.

All hooks have typesnand documentation.

```bash
npm i @storecraft/sdk-react-hooks
```

Main hooks are:

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

## general `useDocument()`

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
} : useDocumentHookReturnType<ProductType & VariantType> = useDocument(
  'products', 
  'product_id_or_handle', 
  autoLoad=true, 
  try_cache_on_autoload=true
);

```

## general `useCollection()`

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
} : useCollectionHookReturnType<ProductType & VariantType> = useCollection(
  'products', 
  // optional initial query,  you can also use the `query` callback
  {
    order: 'desc',
    sortBy: ['updated_at', 'id'],
    startAt: [
      ['updated_at', '2024-12-1']
    ], 
    limit: 10,
    vql: 'color_black | color_white -(color_green)'
  },
  autoLoad=true, 
);

```

TODO: Add specific `useDocument` / `useCollection` hooks for resources


```text
Author: Tomer Shalev (tomer.shalev@gmail.com)
```