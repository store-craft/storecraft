import 'dotenv/config';
import http from "node:http";
import { app } from './app.js';
 
await app.init();

const server = http.createServer(app.handler).listen(
  8000,
  () => {
    console.log(`Server is running on http://localhost:8000`);
  }
); 
