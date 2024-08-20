import { MongoClientOptions } from 'mongodb';

export { MongoDB, migrateToLatest } from './index.js';

export type Config = {
  /** mongo connection url, if absent, will be infered at init
   * with env `app.platform.env.MONGODB_URL` */
  url: string;
  /** the name of the database, if absent, will be infered at init
   * with env `app.platform.env.MONGODB_NAME` */
  db_name?: string;
  /** mongo client options */
  options?: MongoClientOptions;
}