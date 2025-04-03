# Storecraft MongoDB driver for Node.js

<div style="text-align:center">
  <img src='https://storecraft.app/storecraft-color.svg' 
       width='90%' />
</div><hr/><br/>

[![MongoDB](https://github.com/store-craft/storecraft/actions/workflows/test.database-mongodb.yml/badge.svg)](https://github.com/store-craft/storecraft/actions/workflows/test.database-mongodb.yml)

Official `mongodb` driver for `StoreCraft` on **Node.js** / **Deno** / **Bun** platforms.
Also, official support for mongo-db as vector store.

```bash
npm i @storecraft/database-mongodb
```

## usage

```js
import 'dotenv/config';
import http from "node:http";
import { App } from '@storecraft/core'
import { NodePlatform } from '@storecraft/core/platform/node';
import { MongoDB } from '@storecraft/database-mongodb'
import { migrateToLatest } from '@storecraft/database-mongodb/migrate.js'
import { NodeLocalStorage } from '@storecraft/core/storage/node'
import { MongoVectorStore } from '@storecraft/database-mongodb/vector-store'

const app = new App()
.withPlatform(new NodePlatform())
.withDatabase(new MongoDB({}))
.withVectorStore(
  new MongoVectorStore({ embedder: new OpenAIEmbedder() })
)

await app.init();
await migrateToLatest(app.db, false);
// cerate if not exists
await app.vectorstore.createVectorIndex(false, false);

const server = http.createServer(app.handler).listen(
  8000,
  () => {
    console.log(`Server is running on http://localhost:8000`);
  }
); 

```

## Testing Locally (I recommend to use `Atlas`)

1. First start a `mongo-db` server
First, make sure you have `docker` installed,
Then, run

```bash
npm run database-mongodb:docker-compose-up
```

2. create Environment

create `.env` file with

```bash
MONGODB_URL="mongodb://127.0.0.1:27017/?replicaSet=rs0"
MONGODB_NAME="main"
```

3. Run `tests/runner.test.js`

```bash
npm run database-mongodb:test
```


```text
Author: Tomer Shalev <tomer.shalev@gmail.com>
```
