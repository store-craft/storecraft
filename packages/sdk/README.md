# **Storecraft** Official Universal `Javascript` **SDK**

<div style="text-align:center">
  <img src='https://storecraft.app/storecraft-color.svg' 
       width='90%'' />
</div><hr/><br/>

This is the official `storecraft` universal javascript `SDK` which is `fetch` based,
which means you can you it both at browser and at backend runtimes such (`node` / `bun` / `deno`)

It will allow you to fetch / mutate all of the resources at the `backend` in a 
convenient manner with `javascript`, such as:
`products`, `collections`, `authentication`, `customers`, `orders`, `discounts`,
`storage`, `storefronts`, `shipping`, `statistics`, `tags`, `posts`, `notifications`,
`templates`, `extensions` and more :)

```bash
npm i @storecraft/sdk
```

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
    backend: 'http://localhost:8000', 
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
    backend: 'http://localhost:8000', 
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
    backend: 'http://localhost:8000', 
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
    backend: 'http://localhost:8000', 
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


Here are some examples for querying


```js
import { StorecraftSDK } from '@storecraft/sdk'

const sdk = new StorecraftSDK();

const products: ProductType[] = await sdk.products.list(
  {
    expand: ['collections', 'variants'],
    sortBy: ['updated_at', 'id'],
    order: 'desc',
    startAt: [
      ['updated_at': '2024-03-24']
    ],
    limit: 5,
    vql: '(keyword1 | keyword2) -(keyword3)'
  }
)

```


```text
Author: Tomer Shalev (tomer.shalev@gmail.com)
```