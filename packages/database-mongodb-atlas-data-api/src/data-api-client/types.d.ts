interface BaseBody {
  dataSource?: string
  database?: string
  collection?: string
  [key: string]: any
}

type Config = {
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
   * Specific Data App ID.
   * @link https://www.mongodb.com/docs/atlas/api/data-api/#3.-send-a-data-api-request
   */
  appId: string
  /**
   * Specific region name of endpoint.
   * @link https://www.mongodb.com/docs/atlas/api/data-api-resources/#regional-requests
   */
  region?: string
  /**
   * Specific cloud provider of endpoint.
   * @link https://www.mongodb.com/docs/atlas/api/data-api-resources/#regional-requests
   */
  cloud?: string
}