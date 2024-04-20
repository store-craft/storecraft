# **EXPERIMENTAL** Storecraft MongoDB Data API `fetch` driver (only http required)

**DO NOT USE IN PRODUCTION**

Official `mongodb` driver for `StoreCraft` on **atlas** Data API using only http and `fetch`.  
What is it?  
When you create a database at [Mongodb Atlas](https://www.mongodb.com/atlas/database), you have
an option to create an http endpoint to interact with the database securely. This has the benefit
of relying only on `http` connections and therefore can run on all `js` platforms and runtimes even
if they lack raw `tcp` connections (required by official mongodb driver).  

This can run for example on `Cloudflare Workers`


## Notes
- using the [atlas mongodb data api](https://www.mongodb.com/docs/atlas/app-services/data-api/openapi/)
- No support for database transactions, so you may have partial writes and you will
need to retry (this may not be a big deal as writes can be retried)
- Atlas Data api is slower than native driver, make sure your data api endpoint is close to your databse
instance.
- Can run on any `js` runtime and serverless `edge`

## setup
1. Make sure you have a `mongodb` instance with [Atlas](https://www.mongodb.com/atlas/database)
2. Enable **Services > Data API** in the `atlas` console
3. create the service as close as possible to the database instance
4. Write down the following:
  - database name
  - Data source (usually the cluster name)
  - Api Key (You will create it at the `atlas` console)
  - Endpoint (After creation, you will be given a url endpoint)

## usage

```js
import 'dotenv/config';
import http from "node:http";
import { join } from "node:path";
import { homedir } from "node:os";

import { App } from '@storecraft/core'
import { NodePlatform } from '@storecraft/platform-node'
import { MongoDB } from '@storecraft/database-mongodb-atlas-data-api'
import { NodeLocalStorage } from '@storecraft/storage-node-local'

let app = new App(
  new NodePlatform(),
  new MongoDB({ 
    db_name: 'test-data-api', apiKey: '<API-KEY>', 
    dataSource: '<DATA-SOURCE>', endpoint: '<ENDPOINT>'}
  ),
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