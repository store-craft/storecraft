import 'dotenv/config';
import { app } from './app.js';
 
await app.init();
await app.db.migrateToLatest();
