# **Storecraft** Official Universal `Javascript` **SDK**

<div style="text-align:center">
  <img src='https://storecraft.app/storecraft-color.svg' 
       width='90%' />
</div><hr/><br/>

# **Storecraft** Official Universal `Javascript` **SDK**

This is the official `storecraft` universal javascript `SDK` which is `fetch` based,
which means you can you it both at browser and at backend runtimes such as,
- `node`
- `bun`
- `deno`
- `cloudflare workers`

Start by installing the package:

```bash
npm i @storecraft/sdk
```

## Resources

The SDK is a wrapper around the `storecraft` REST API, and it allows you to
perform operations on the following resources:

### collections
- **products** - manage products
- **collections** - manage collections
- **auth_users** - manage auth users
- **customers** - manage customers
- **orders** - manage orders
- **discounts** - manage discounts
- **storefronts** - manage storefronts
- **shipping** - manage shipping
- **tags** - manage tags
- **posts** - manage posts
- **notifications** - manage notifications
- **templates** - manage templates
- **extensions** - manage extensions
- **payments** - manage payment gateways
- **images** - manage images

### Auth

Perform authentication such as `signin` / `signup` / `api-key`

### Checkout

Perform checkout `create` / `complete` with payment gateways such as `stripe` / `paypal`.

### Storage

Perform storage operations such as `put` / `get` / `delete`

### Payments

Perform payments `status-check` / `invoke-action`

### Statistics

- Query some basic statistics about `orders` in a time span
- Query count of items in collections

### AI

Speak with a `storecraft` agent (Supports streaming :))

### Semantic / Similarity Search

Search Storecraft with AI for similar `products`, `discounts`, `collections`, `shipping` based on a prompt.

### Quick Search

List super lite search results with `id`, `handle`, `title` over most resources 

<hr/>

## Authentication

Authentication and authorization is required for some resources, such as:
- Upserting / Removing (mutations) resources
- Querying a customer orders

Besides that, most of the resources are public and do not require authentication.


There are two strategies for `authentication`:


### **Api Key** Authentication

```js
import { StorecraftSDK } from '@storecraft/sdk'

const sdk = new StorecraftSDK(
  {
    endpoint: 'http://localhost:8000', 
    auth: {
      apikey: <YOUR-API-KEY>
    }
  }
)

```

### **JWT** Authentication

You can `sign in`, and the `sdk` will save the `auth` result ans
will re-authenticate with `refresh token` when needed.


```js
import { StorecraftSDK } from '@storecraft/sdk'

const sdk = new StorecraftSDK(
  {
    endpoint: 'http://localhost:8000', 
  }
);

const auth_result = await sdk.auth.signin(email, password);

```

You, can also instantiate the `sdk` with previous authentication 
information like so:

```js
import { StorecraftSDK } from '@storecraft/sdk'

const sdk = new StorecraftSDK(
  {
    endpoint: 'http://localhost:8000', 
    auth: {
      access_token: <OPTIONAL-ACCESS-TOKEN>,
      refresh_token: <OPTIONAL-REFRESH-TOKEN>,
    }
  }
)

```

### subscribe to **JWT** auth updates

You can subscribe to auth updates like so:

```js
import { StorecraftSDK } from '@storecraft/sdk'

const sdk = new StorecraftSDK(
  {
    endpoint: 'http://localhost:8000', 
  }
);

sdk.auth.add_sub(
  ({ auth: ApiAuthResult, isAuthenticated: boolean }) => {
    // Do something, like save locally
  }
);

const auth_result = await sdk.auth.signin(email, password);
const auth_result = await sdk.auth.signout();

```


## Querying

Here are some examples for querying.

- Every key and string in the example below is fully typed with `typescript`,
- so you get **intellisense** out of the box for better developer experience
- And, you don't have to guess anything


```ts
import { StorecraftSDK } from '@storecraft/sdk'

const sdk = new StorecraftSDK();

const products: ProductType[] = await sdk.products.list(
  {
    expand: ['collections', 'variants'],
    sortBy: ['updated_at', 'id'],
    order: 'desc',
    vql: {
      updated_at: {
        $gte: '2024-03-24',
      },
      active: true,
      $or: [
        { $search: 'tag:genre_action' },
        { $search: 'tag:genre_sports' },
      ],
    }
    limit: 5,
  }
)

```

Or, 

```ts
import { StorecraftSDK } from '@storecraft/sdk'

const sdk = new StorecraftSDK();

const collections: CollectionType[] = await sdk.collections.list(
  {
    vql: 'active=true & (nintendo | playstation)'
    limit: 5,
  }
);

```

## Testing

most of the tests for this package are done in the `storecraft` `core` package,
as part of the **REST API** tests.

This package will hold more `unit` tests for the `sdk` itself, which include
side effects and particular behaviours.

```text
Author: Tomer Shalev (tomer.shalev@gmail.com)
```