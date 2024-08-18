import 'dotenv/config';
import { app } from './app.js';
 
await app.init();

// const server = http.createServer(app.handler).listen(
//   8000,
//   () => {
//     console.log(`Server is running on http://localhost:8000`);
//   }
// ); 

const server = Bun.serve(
  {
    port: 8000,
    fetch: app.handler
  }
);

console.log(`Listening on http://localhost:${server.port} ...`);

