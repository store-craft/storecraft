export { GoogleAuth } from './index.js'

export type Config = {
  /**
   * @description If missing, will
   * be inferred from env-var `IDP_GOOGLE_CLIENT_ID` at init time
   */
  client_id?: string;
  /**
   * @description If missing, will
   * be inferred from env-var `IDP_GOOGLE_CLIENT_SECRET` at init time
   */
  client_secret?: string;
}