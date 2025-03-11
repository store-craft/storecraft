export { SendGrid } from './adapter.js';

/**
 * @description `sendgrid` config
 */
export type Config = {

  /**
   * @description Your API Key, if missing, it will be inferred from environment variable `SENDGRID_API_KEY`
   */
  apikey?: string,

};

