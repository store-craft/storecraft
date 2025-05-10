import 'dotenv/config';
import { migrateToLatest } from '@storecraft/database-turso/migrate.js';
import seed_data from './seed/video-game-store/data.json' with { type: 'json' };
import { seed } from './seed/index.js';
import http from "node:http";
import { app } from './app.js';
 
// migrate database if needed
await migrateToLatest(app.__show_me_everything.db, false);
// seed
await seed(app, seed_data);
// create vector index
await app.__show_me_everything.vector_store?.createVectorIndex(true);
// start server
http
.createServer(app.handler)
.listen(
  8001,
  () => {
    app.print_banner('http://localhost:8001');
  }
); 
