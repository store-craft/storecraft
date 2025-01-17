# Storecraft MongoDB driver for Node.js

<div style="text-align:center">
  <img src='https://storecraft.app/storecraft-color.svg' 
       width='90%' />
</div><hr/><br/>

[![MongoDB](https://github.com/store-craft/storecraft/actions/workflows/test.database-mongodb.yml/badge.svg)](https://github.com/store-craft/storecraft/actions/workflows/test.database-mongodb.yml)

Official `mongodb` driver for `StoreCraft` on **Node.js** / **Deno** / **Bun** platforms.

```bash
npm i @storecraft/database-mongodb
```

## usage

```js
import 'dotenv/config';
import http from "node:http";
import { App } from '@storecraft/core'
import { NodePlatform } from '@storecraft/core/platform/node';
import { MongoDB, migrateToLatest } from '@storecraft/database-mongodb'
import { NodeLocalStorage } from '@storecraft/core/storage/node'

const app = new App(
  {
    auth_admins_emails: ['admin@sc.com'],
    auth_secret_access_token: 'auth_secret_access_token',
    auth_secret_refresh_token: 'auth_secret_refresh_token'
  }
)
.withPlatform(new NodePlatform())
.withDatabase(new MongoDB({ db_name: 'test', url: '...', options: {}}))

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
