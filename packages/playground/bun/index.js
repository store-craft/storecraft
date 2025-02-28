import 'dotenv/config';
import { app } from './app.js';
 
await app.init(false);

// @ts-ignore
Bun.serve(
  {
    port: 8000,
    fetch: app.handler
  }
);

app.print_banner(`http://localhost:8000`)

