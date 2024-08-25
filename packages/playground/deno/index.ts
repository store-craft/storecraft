import { app } from './app.ts';

 
await app.init();

const server = Deno.serve(
  {
    port: 8000,
    fetch: app.handler
  }
);

console.log(`Listening on http://localhost:${server.port} ...`);

