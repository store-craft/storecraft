# Storecraft `SQL` driver

<div style="text-align:center">
  <img src='https://storecraft.app/storecraft-color.svg' 
       width='90%' />
</div><hr/><br/>

Official `SQL` driver for `StoreCraft` with the dialects abstracted with `Kysely` or your own drivers.

```bash
npm i @storecraft/database-sql-base
```

## usage

```js
import 'dotenv/config';
import http from "node:http";
import { App } from '@storecraft/core'
import { NodePlatform } from '@storecraft/core/platform/node';
import { SQL } from '@storecraft/database-sql-base'
import { migrateToLatest } from '@storecraft/database-sql-base/migrate.js'
import { NodeLocalStorage } from '@storecraft/storage-local/node'

const app = new App(
  {
    auth_admins_emails: ['admin@sc.com'],
    auth_secret_access_token: 'auth_secret_access_token',
    auth_secret_refresh_token: 'auth_secret_refresh_token'
  }
)
.withPlatform(new NodePlatform())
.withDatabase(
  new SQL({
    dialect: sqlite_dialect, 
    dialect_type: 'SQLITE'
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

## Testing Locally

### **SQLite**
1. Simply `runner.sqlite-local.test.js`
```bash
npm run test:sqlite
```

### **Postgres**
1. First setup a `postgres` server
```bash
docker pull postgres
docker run --name some-postgres -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=admin \
          -e PGDATA=/var/lib/postgresql/data/pgdata \
	        -v $(pwd):/var/lib/postgresql/data \
          -p 5432:5432 -d postgres
```

2. create Environment
create `.env` file with
```bash
POSTGRES_USER='user'
POSTGRES_PASSWORD='password'
POSTGRES_PORT=5432
POSTGRES_HOST='localhost'
```

3. Run `runner.postgres-local.test.js`
```bash
npm run test:postgres
```

### **MySQL**
1. First setup a `mysql` server
```zsh
docker pull mysql
docker run --name mysql \
           -v $(pwd):/etc/mysql/conf.d \
           -v /my/own/datadir:/var/lib/mysql \
           -e MYSQL_ROOT_PASSWORD=admin -e MYSQL_ROOT_HOST=localhost \
           -e MYSQL_DATABASE=main -e MYSQL_USER=admin -e MYSQL_PASSWORD=admin \
           -p 8080:3306 -d mysql
```

2. create Environment
create `.env` file with
```bash
MYSQL_USER='root'
MYSQL_ROOT_PASSWORD='password'
MYSQL_PORT=8080
MYSQL_HOST='localhost'
```

3. Run `runner.mysql-local.test.js`
```bash
npm run test:mysql
```

### **MSSQL** (Currently NOT SUPPORTED, waiting for votes on that one)
Work in progress, i will probably not continue with this.

1. First setup a `mysql` server
```zsh
docker pull mcr.microsoft.com/mssql/server
# use this For OSX with M1 chips
docker pull mcr.microsoft.com/azure-sql-edge:latest
docker run --name some-mssql \
           -e ACCEPT_EULA=Y -e MSSQL_SA_PASSWORD='Abcd1234!?' \
           -v $(pwd):/var/opt/mssql \
           -p 1433:1433 \
           -d mcr.microsoft.com/azure-sql-edge:latest

```

2. create Environment
create `.env` file with
```bash
MYSQL_USER='root'
MYSQL_ROOT_PASSWORD='password'
MYSQL_PORT=8080
MYSQL_HOST='localhost'
```

3. Run `runner.mysql-local.test.js`
```bash
npm run test:mysql
```


```text
Author: Tomer Shalev <tomer.shalev@gmail.com>
```