import 'dotenv/config';
import http from "node:http";
import { join } from "node:path";
import { homedir } from "node:os";

import { App } from '@storecraft/core'
import { Platform } from '@storecraft/platform-node'
import { Database } from '@storecraft/db-mongodb-node'
import { Storage } from '@storecraft/storage-node-local'
import { R2 } from '@storecraft/storage-s3-compatible'

let app = new App(
  new Platform(),
  new Database(),
  // new Storage(join(homedir(), 'tomer'))
  new R2('test', process.env.R2_ACCOUNT_ID, process.env.R2_ACCESS_KEY_ID, process.env.R2_SECRET_ACCESS_KEY )
);

await app.init();
 
const server = http.createServer(app.handler).listen(
  8000,
  () => {
    console.log(`Server is running on http://localhost:8000`);
  }
); 
