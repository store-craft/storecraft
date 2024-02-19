import { MongoClientOptions } from 'mongodb';

export * from './index.js'

export type Config = {
  /** mongo connection url */
  url: string;
  /** mongo client options */
  options?: MongoClientOptions;
  /** the name of the database */
  db_name?: string;
}