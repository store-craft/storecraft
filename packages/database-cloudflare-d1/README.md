# Storecraft Cloudflare D1 Database support

Two variants,
1. D1 over http (used for migrations)
2. D1 over cloudflare-worker runtime (used for backend)

<div style="text-align:center">
  <img src='https://storecraft.app/storecraft-color.svg' 
       height='150px' />
</div><hr/><br/>

Official `Cloudflare D1` driver for `StoreCraft` on any platforms.

```bash
npm i @storecraft/database-cloudflare-d1
```

## Setup

- First, login to your cloudflare account.
- Create a `D1` database.
- Create an API Key at [here](https://dash.cloudflare.com/profile/api-tokens)


## usage

```js
import { App } from '@storecraft/core'
import { D1_WORKER } from "@storecraft/database-cloudflare-d1"
import { CloudflareWorkersPlatform } from "@storecraft/platforms/cloudflare-workers"

let app = new App(
  {
    storage_rewrite_urls: undefined,
    general_store_name: 'Wush Wush Games',
    general_store_description: 'We sell cool retro video games',
    general_store_website: 'https://wush.games',
    auth_admins_emails: ['tomer.shalev@gmail.com']
  }
)
.withPlatform(new CloudflareWorkersPlatform())
.withDatabase(
  new D1_WORKER(
    {
      db: env.D1
    } 
  )
)

await app.init();
 
const server = http.createServer(app.handler).listen(
  8000,
  () => {
    console.log(`Server is running on http://localhost:8000`);
  }
); 

```

```text
Author: Tomer Shalev <tomer.shalev@gmail.com>
```