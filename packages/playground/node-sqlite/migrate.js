import 'dotenv/config';
import { app } from './app.js';
import { migrateToLatest } from '@storecraft/database-sqlite/migrate.js';
 
await migrateToLatest(app.__show_me_everything.db, true);
