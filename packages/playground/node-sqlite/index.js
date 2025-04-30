import 'dotenv/config';
import http from "node:http";
import { app } from './app.js';
 
await app.init(false);

http.createServer(app.handler).listen(
  8000,
  () => {
    app.print_banner('http://localhost:8000');
  }
); 
