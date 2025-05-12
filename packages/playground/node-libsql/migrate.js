import 'dotenv/config';
import { app } from './app.js';
import { migrateToLatest } from '@storecraft/database-turso/migrate.js';

await migrateToLatest(app.__show_me_everything.db, true);
await app.__show_me_everything.vector_store?.createVectorIndex(true);