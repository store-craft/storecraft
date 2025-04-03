# Storecraft `Postgres` driver

<div style="text-align:center">
  <img src='https://storecraft.app/storecraft-color.svg' 
       width='90%' />
</div><hr/><br/>

[![SQLite / Postgres / MySQL](https://github.com/store-craft/storecraft/actions/workflows/test.database-sql.yml/badge.svg)](https://github.com/store-craft/storecraft/actions/workflows/test.database-sql.yml)

Official `Postgres` driver for `StoreCraft` using `pg` package.

```bash
npm i @storecraft/database-postgres
```

## usage

```js
import 'dotenv/config';
import http from "node:http";
import { App } from '@storecraft/core'
import { NodePlatform } from '@storecraft/core/platform/node';
import { NodeLocalStorage } from '@storecraft/core/storage/node'
import { Postgres } from '@storecraft/database-postgres';
import { migrateToLatest } from '@storecraft/database-sql-base/migrate.js'

const app = new App(
  {
    auth_admins_emails: ['admin@sc.com'],
  }
)
.withPlatform(new NodePlatform())
.withDatabase(
  new Postgres({
    pool_config: {
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSTGRES_PORT),
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
    }
  })
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

Storecraft will search the following `env` variables

```bash
POSTGRES_USER='admin'
POSTGRES_PASSWORD='admin'
POSTGRES_PORT=6432
POSTGRES_HOST='localhost'
```

So, you can instantiate with empty config
```ts
.withDatabase(
  new Postgres()
)
```


## Testing Locally

1. First start a `postgres` server
First, make sure you have `docker` installed,
Then, run

```bash
npm run database-postgres:docker-compose-up
```

2. create Environment

create `.env` file with

```bash
POSTGRES_USER='admin'
POSTGRES_PASSWORD='admin'
POSTGRES_PORT=6432
POSTGRES_HOST='localhost'
```

3. Run `tests/runner.test.js`

```bash
npm run database-postgres:test
```


```text
Author: Tomer Shalev <tomer.shalev@gmail.com>
```