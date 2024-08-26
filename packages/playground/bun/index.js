import 'dotenv/config';
import { app } from './app.js';
 
await app.init();

const server = Bun.serve(
  {
    port: 8000,
    fetch: app.handler
  }
);

console.log(`Listening on http://localhost:${server.port} ...`);

