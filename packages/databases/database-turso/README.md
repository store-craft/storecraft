# Storecraft Turso (libsql) Database support

<div style="text-align:center">
  <img src='https://storecraft.app/storecraft-color.svg' 
       width='90%' />
</div><hr/><br/>

Official `libSql` / `Turso` driver for `StoreCraft` on any platform.
Includes a vector store.

```bash
npm i @storecraft/database-turso
```

## Local usage

```js
import 'dotenv/config';
import http from "node:http";
import { App } from '@storecraft/core'
import { NodePlatform } from '@storecraft/core/platform/node';
import { NodeLocalStorage } from '@storecraft/core/storage/node'
import { LibSQL, LibSQLVectorStore } from '@storecraft/database-turso'
import { migrateToLatest } from '@storecraft/database-turso/migrate.js'

const app = new App(
  {
    auth_admins_emails: ['admin@sc.com'],
  }
)
.withPlatform(new NodePlatform())
.withDatabase(
  new LibSQL(
    { 
      url: 'file:local.db',
    }
  )
)
.withStorage(new NodeLocalStorage('storage'))
.withVectorStore(
  new LibSQLVectorStore(
    {
      embedder: new OpenAIEmbedder(),
      url: 'file:local-vector.db'
    }
  )
)

await app.init();
await migrateToLatest(app.db, false);
await app.vectorstore.createVectorIndex();

const server = http.createServer(app.handler).listen(
  8000,
  () => {
    console.log(`Server is running on http://localhost:8000`);
  }
); 

```

Storecraft will search the following `env` variables

```bash
LIBSQL_URL=./data.db
# optional, if absent will use the same as LIBSQL_URL
LIBSQL_VECTOR_URL=./data-vector.db
```

So, you can instantiate with empty config

```ts
.withDatabase(
  new Turso()
)
.withVectorStore(
  new LibSQLVectorStore(
    {
      embedder: new OpenAIEmbedder(),
    }
  )
)
```


## Cloud usage

connect to a cloud `libsql` and `Turso` platform
- First, login to your [turso](https://turso.tech) account.
- Create a database.
- Create an API Key.


## usage

```js
import 'dotenv/config';
import http from "node:http";
import { App } from '@storecraft/core'
import { NodePlatform } from '@storecraft/core/platform/node';
import { NodeLocalStorage } from '@storecraft/core/storage/node'
import { Turso, LibSQLVectorStore } from '@storecraft/database-turso'
import { migrateToLatest } from '@storecraft/database-turso/migrate.js'

const app = new App(
  {
    auth_admins_emails: ['admin@sc.com'],
  }
)
.withPlatform(new NodePlatform())
.withDatabase(
  new Turso(
    { 
      prefers_batch_over_transactions: true,
      // all of these configurations can be inferred by env variables at init
      url: process.env.LIBSQL_URL,
      authToken: process.env.LIBSQL_API_TOKEN,
    }
  )
)
.withStorage(new NodeLocalStorage('storage'))
.withVectorStore(
  new LibSQLVectorStore(
    {
      embedder: new OpenAIEmbedder(),
      url: process.env.LIBSQL_URL,
      authToken: process.env.LIBSQL_API_TOKEN,
    }
  )
)

await app.init();
await migrateToLatest(app.db, false);
await app.vectorstore.createVectorIndex();

const server = http.createServer(app.handler).listen(
  8000,
  () => {
    console.log(`Server is running on http://localhost:8000`);
  }
); 

```

Storecraft will search the following `env` variables

```bash
LIBSQL_URL=libsql://<your_database_name>.something.com
LIBSQL_AUTH_TOKEN=your_api_key
```

So, you can instantiate with empty config

```ts
.withDatabase(
  new Turso()
)
.withVectorStore(
  new LibSQLVectorStore(
    {
      embedder: new OpenAIEmbedder(),
    }
  )
)
```



```text
Author: Tomer Shalev <tomer.shalev@gmail.com>
```