# Storecraft Neon (cloud postgres) Database support

<div style="text-align:center">
  <img src='https://storecraft.app/storecraft-color.svg' 
       width='90%' />
</div><hr/><br/>

Official `Neon` driver for `StoreCraft` on any platforms. Supports two serverless drivers:
1. `NeonServerless` - serverless neon, supports interactive transactions over websockets.
2. `NeonHttp` - serverless http only neon, supports NON-interactive transactions, only batches over HTTP.

```bash
npm i @storecraft/database-neon
```

## Setup

- First, login to your [neon account](https://neon.tech) account.
- Create a database.
- Copy the `connection string`.


## usage

```js
import 'dotenv/config';
import http from "node:http";
import { App } from '@storecraft/core'
import { NodePlatform } from '@storecraft/core/platform/node';
import { NeonHttp, NeonServerless } from '@storecraft/database-neon'
import { NodeLocalStorage } from '@storecraft/core/storage/node'
import { migrateToLatest } from '@storecraft/database-neon/migrate.js'

const app = new App(
  {
    auth_admins_emails: ['admin@sc.com'],
    auth_secret_access_token: 'auth_secret_access_token',
    auth_secret_refresh_token: 'auth_secret_refresh_token'
  }
)
.withPlatform(new NodePlatform())
.withDatabase(
  new NeonHttp(
    { 
      connectionString: process.env.NEON_CONNECTION_URL
    }
  )
)
.withStorage(new NodeLocalStorage('storage'))
.init();

await migrateToLatest(app.__show_me_everything.db, false);
await app.__show_me_everything.vector_store.createVectorIndex();

http.createServer(app.handler).listen(
  8000,
  () => {
    app.print_banner('http://localhost:8000');
  }
); 

```

```text
Author: Tomer Shalev <tomer.shalev@gmail.com>
```