export { DummyAuth } from './index.js'

export type Config = {
  /**
   * @description If missing, will
   * be inferred from env-var `IDP_DUMMY_APP_ID` at init time
   */
  app_id?: string;
  /**
   * @description If missing, will
   * be inferred from env-var `IDP_DUMMY_APP_SECRET` at init time
   */
  app_secret?: string;
}