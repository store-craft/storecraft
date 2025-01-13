# Storecraft `MySQL` driver

<div style="text-align:center">
  <img src='https://storecraft.app/storecraft-color.svg' 
       width='90%' />
</div><hr/><br/>

Official `MySQL` driver for `StoreCraft` using `mysql2` package.

```bash
npm i @storecraft/database-mysql
```

## usage

```js
import 'dotenv/config';
import http from "node:http";
import { App } from '@storecraft/core'
import { NodePlatform } from '@storecraft/core/platform/node';
import { NodeLocalStorage } from '@storecraft/core/storage/node'
import { MySQL } from '@storecraft/database-mysql';
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
  new MySQL(
    {
      pool_options: {
        database: process.env.MYSQL_DATABASE,
        host: process.env.MYSQL_HOST,
        port: parseInt(process.env.MYSQL_PORT),
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
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

## Testing Locally

1. First setup a `mysql` server

```zsh
docker pull mysql
docker run --name mysql \
           -v $(pwd):/etc/mysql/conf.d \
           -v /my/own/datadir:/var/lib/mysql \
           -e MYSQL_DATABASE=main -e MYSQL_ROOT_PASSWORD=password \
           -p 3306:3306 -d mysql
```

2. create Environment

create `.env` file with

```bash
MYSQL_USER=root
MYSQL_PASSWORD=password
MYSQL_DATABASE=main
MYSQL_PORT=3306
MYSQL_HOST=localhost
```

3. Run `tests/runner.test.js`

```bash
npm run database-mysql:test
```

```text
Author: Tomer Shalev <tomer.shalev@gmail.com>
```