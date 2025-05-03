import 'dotenv/config';
import { migrateToLatest } from '@storecraft/database-turso/migrate.js';
import seed_data from './seed/video-game-store/data.json' with { type: 'json' };
import { seed } from './seed/index.js';
import http from "node:http";
import { app } from './app.js';
 
// init app
await app.init(false);
// migrate database if needed
await migrateToLatest(app.db, false);
// seed
await seed(app, seed_data);
// create vector index
await app.vectorstore?.createVectorIndex(true);
// start server
http
.createServer(app.handler)
.listen(
  8001,
  () => {
    app.print_banner('http://localhost:8001');
  }
); 
