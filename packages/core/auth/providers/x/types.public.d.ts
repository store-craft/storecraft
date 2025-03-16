export { XAuth } from './index.js'

export type Config = {
  /**
   * @description Consumer API key for OAuthV1 flow. If missing, will
   * be inferred from env-var `IDP_X_CONSUMER_API_KEY` at init time
   */
  consumer_api_key?: string;
  /**
   * @description Consumer API Secret for OAuthV1 flow. If missing, will
   * be inferred from env-var `IDP_X_CONSUMER_API_SECRET` at init time
   */
  consumer_api_secret?: string;
}