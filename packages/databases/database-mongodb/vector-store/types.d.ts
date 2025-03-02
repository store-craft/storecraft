import { MongoClientOptions } from 'mongodb';

export type Config = {
  /**
   * @description mongo connection url, if absent, will be infered at init
   * with env `app.platform.env.MONGODB_URL`
   */
  url?: string;

  /** 
   * @description the name of the database, if absent, will be infered at init
   * with env `app.platform.env.MONGODB_NAME` 
   */
  db_name?: string;

  /** 
   * @description mongo client options 
   */
  options?: MongoClientOptions;

  /**
   * @description The name of the index
   * @default 'vector_store'
   */
  index_name?: string,

  /**
   * @description The dimensions of the vectors
   */
  dimensions: number,

  /**
   * @description The similiarity metric
   * @default 'cosine'
   */
  similarity?: 'euclidean' | 'cosine' | 'dotProduct'
}
