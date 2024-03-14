# Storecraft `SQL` driver

Official `SQL` driver for `StoreCraft` with the dialects abstracted with `Kysely` or your own drivers.

## usage

```js
import 'dotenv/config';
import http from "node:http";
import { join } from "node:path";
import { homedir } from "node:os";

import { App } from '@storecraft/core'
import { NodePlatform } from '@storecraft/platform-node'
import { MongoDB } from '@storecraft/database-mongodb-node'
import { NodeLocalStorage } from '@storecraft/storage-node-local'

let app = new App(
  new NodePlatform(),
  new MongoDB({ db_name: 'prod', url: '<MONGO-URL>'}),
  new NodeLocalStorage(join(homedir(), 'tomer'))
);

await app.init();
 
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
docker run --name some-postgres -e POSTGRES_USER=user -e POSTGRES_PASSWORD=password \
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

### **MySql**
1. First setup a `mysql` server
```zsh
docker pull mysql
docker run --name some-mysql -v $(pwd):/etc/mysql/conf.d \
           -e MYSQL_ROOT_PASSWORD=mysql -e MYSQL_ROOT_HOST=localhost \
           -e MYSQL_DATABASE=main -e MYSQL_USER=mysql -e MYSQL_PASSWORD=mysql \
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


```text
Author: Tomer Shalev <tomer.shalev@gmail.com>
```