import 'dotenv/config';
import { app } from './app.js';
import { migrateToLatest } from '@storecraft/database-mongodb/migrate.js';
import { MongoVectorStore } from '@storecraft/database-mongodb/vector-store';
 
await app.init();
await migrateToLatest(app.db, true);
