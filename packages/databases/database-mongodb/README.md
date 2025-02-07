# Storecraft MongoDB driver for Node.js

<div style="text-align:center">
  <img src='https://storecraft.app/storecraft-color.svg' 
       width='90%' />
</div><hr/><br/>

[![MongoDB](https://github.com/store-craft/storecraft/actions/workflows/test.database-mongodb.yml/badge.svg)](https://github.com/store-craft/storecraft/actions/workflows/test.database-mongodb.yml)

Official `mongodb` driver for `StoreCraft` on **Node.js** / **Deno** / **Bun** platforms.
Also, an example of [Semantic Vector Search](https://www.mongodb.com/developer/products/atlas/semantic-search-mongodb-atlas-vector-search/) extension at `@storecraft/database-mongodb/vector-search-extension`

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
import { MongoVectorSearch } from '@storecraft/database-mongodb/vector-search-extension'

const app = new App(
  {
    auth_admins_emails: ['admin@sc.com'],
    auth_secret_access_token: 'auth_secret_access_token',
    auth_secret_refresh_token: 'auth_secret_refresh_token'
  }
)
.withPlatform(new NodePlatform())
.withDatabase(new MongoDB({ db_name: 'test', url: '...', options: {}}))
.withExtensions(
  'mongo-vector-search': new MongoVectorSearch({ openai_key: process.env.OPENAI })
)

await app.init();
await migrateToLatest(app.db, false);

const server = http.createServer(app.handler).listen(
  8000,
  () => {
    console.log(`Server is running on http://localhost:8000`);
  }
); 

```

## (Recommended) setup semantic/ai vector search extension for products

1. in [Atlas](https://cloud.mongodb.com/) dashboard, create a vector index (call it `vector_index`) for `products` collection:

```json
{
  "fields": [
    {
      "numDimensions": 1536,
      "path": "embedding",
      "similarity": "cosine",
      "type": "vector"
    }
  ]
}
```

2. Now, every upserted product will be eligible for semantic search by it's title + description.
3. The extension is publicly available via HTTP (`POST` request)
```js
await fetch(
  'http://localhost:8000/api/extensions/mongo-vector-search/search',
  {
    method: 'POST',
    body: JSON.stringify(
      {
        query: 'I am interested in Nintendo related clothing, such as shirts',
        limit: 1
      }
    )
  }
)
```

returns `ProductType[]` array

```json
[
  {
    "title": "Super Mario T Shirt",
    "handle": "super-mario-t-shirt",
    "description": "This Super mario shirt is XL size and 
    features a colorful print of Lugi and Mario.",
    "media": [
        "storage://images/super-mario-shirt_1738686680944_w_819_h_460.jpeg"
    ],
    "price": 100,
    "qty": 1,
    "active": true,
    "id": "pr_67a240e4000000d34bcf0743",
    "created_at": "2025-02-04T16:31:32.909Z",
    "updated_at": "2025-02-04T16:58:25.286Z"
  }
]
```


```text
Author: Tomer Shalev <tomer.shalev@gmail.com>
```
