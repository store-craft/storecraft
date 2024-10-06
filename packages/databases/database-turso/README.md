# Storecraft Turso (libsql) Database support

<div style="text-align:center">
  <img src='https://storecraft.app/storecraft-color.svg' 
       width='90%' />
</div><hr/><br/>

Official `Turso` / `libSql` driver for `StoreCraft` on any platforms.

```bash
npm i @storecraft/database-turso
```

## Setup

- First, login to your [turso](https://turso.tech) account.
- Create a database.
- Create an API Key.


## usage

```js
import 'dotenv/config';
import http from "node:http";
import { App } from '@storecraft/core'
import { NodePlatform } from '@storecraft/core/platform/node';
import { NodeLocalStorage } from '@storecraft/storage-local/node'
import { Turso } from '@storecraft/database-turso'
import { migrateToLatest } from '@storecraft/database-turso/migrate.js'

const app = new App(
  {
    auth_admins_emails: ['admin@sc.com'],
    auth_secret_access_token: 'auth_secret_access_token',
    auth_secret_refresh_token: 'auth_secret_refresh_token'
  }
)
.withPlatform(new NodePlatform())
.withDatabase(
  new Turso(
    { 
      prefers_batch_over_transactions: true,
      libsqlConfig: {
        url: process.env.TURSO_URL,
        authToken: process.env.TURSO_API_TOKEN,
      }
    }
  )
)
.withStorage(new NodeLocalStorage('storage'))

await app.init();
await migrateToLatest(app.db, false);
 
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