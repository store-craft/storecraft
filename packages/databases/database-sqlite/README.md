# Storecraft `SQLite` driver

<div style="text-align:center">
  <img src='https://storecraft.app/storecraft-color.svg' 
       width='90%' />
</div><hr/><br/>

Official `SQLite` driver for `StoreCraft` using `better-sqlite` package.

```bash
npm i @storecraft/database-sqlite
```

## usage

```js
import 'dotenv/config';
import http from "node:http";
import { App } from '@storecraft/core'
import { NodePlatform } from '@storecraft/platforms/node';
import { NodeLocalStorage } from '@storecraft/storage-local/node'
import { SQLite } from '@storecraft/database-sqlite'
import { migrateToLatest } from '@storecraft/database-sql-base/migrate.js'

const app = new App(
  {
    auth_admins_emails: ['admin@sc.com'],
    auth_secret_access_token: 'auth_secret_access_token',
    auth_secret_refresh_token: 'auth_secret_refresh_token'
  }
)
.withPlatform(new NodePlatform())
.withDatabase(
  new SQLite(
    { 
      filename: join(homedir(), 'db.sqlite') 
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

## Testing Locally

Simply run `tests/runner.test.js`

```bash
npm run database-sqlite:test
```

```text
Author: Tomer Shalev <tomer.shalev@gmail.com>
```