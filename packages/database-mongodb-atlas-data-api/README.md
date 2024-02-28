# Storecraft MongoDB driver for js platforms with `fetch` (only http required)

Official `mongodb` driver for `StoreCraft` on **js** platforms using only http and `fetch`.

## Notes
- using the [atlas mongodb data api](https://www.mongodb.com/docs/atlas/app-services/data-api/openapi/)
- No support for database transactions, so you may have partial writes and you will
need to retry (this may not be a big deal as writes can be retried)

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

```text
Author: Tomer Shalev <tomer.shalev@gmail.com>
```