import { MongoClientOptions } from 'mongodb';

export { MongoDB, migrateToLatest, MongoVectorStore } from './index.js';

export type Config = {
  /**
   * @description mongo connection url, if absent, will be infered at init
   * with env `app.platform.env.MONGODB_URL`
   */
  url?: string;

  /** 
   * @description the name of the database, if absent, will be infered at init
   * with env `app.platform.env.MONGODB_NAME` 
   * @default 'main'
   */
  db_name?: string;

  /** 
   * @description mongo client options 
   */
  options?: MongoClientOptions;
}

