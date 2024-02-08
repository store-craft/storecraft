import http from "node:http";
import { App } from '@storecraft/core'
import { NodeAdapter } from '@storecraft/platform-node'
import { Driver } from '@storecraft/db-mongodb-node'

const host = 'localhost';
const port = 8000;

let app = new App(
  new NodeAdapter(),
  new Driver()
);

await app.init();
 
const server = http.createServer(app.handler).listen(
  port, host, 
  () => {
    console.log(`Server is running on http://${host}:${port}`);
  }
);
