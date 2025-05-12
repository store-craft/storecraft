import 'dotenv/config';
import http from "node:http";
import { app } from './app.js';
 
http.createServer(app.handler).listen(
  8002,
  () => {
    app.print_banner('http://localhost:8002');
  }
); 
