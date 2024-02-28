export type Config = {
  /** The name of a linked MongoDB Atlas data source. This is commonly 
   * "mongodb-atlas" though it may be different in your App if you chose 
   * a different name when you created the data source 
   */
  dataSource?: string
  /**
   * Specific Data API key.
   * @link https://www.mongodb.com/docs/atlas/api/data-api/#2.-create-a-data-api-key
   */
  apiKey: string
  /**
   * Endpoint given to you by the Atlas data api
   */
  endpoint: string,
  /**
   * The database name
   */
  db_name: string
}

export { MongoDBDataAPIClient, Collection } from './index.js'