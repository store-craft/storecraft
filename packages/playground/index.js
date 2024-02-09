import http from "node:http";
import { join } from "node:path";
import { homedir } from "node:os";

import { App } from '@storecraft/core'
import { Platform } from '@storecraft/platform-node'
import { Database } from '@storecraft/db-mongodb-node'
import { Storage } from '@storecraft/storage-node-local'

let app = new App(
  new Platform(),
  new Database(),
  new Storage(join(homedir(), 'tomer'))
);

await app.init();
 
const server = http.createServer(app.handler).listen(
  8000,
  () => {
    console.log(`Server is running on http://localhost:8000`);
  }
); 
