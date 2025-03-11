import 'dotenv/config';
import { app } from './app.js';
import { migrateToLatest } from '@storecraft/database-turso/migrate.js';

await app.init();
await migrateToLatest(app.db, true);
await app.vectorstore?.createVectorIndex();