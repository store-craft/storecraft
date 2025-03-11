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


```text
Author: Tomer Shalev <tomer.shalev@gmail.com>
```
