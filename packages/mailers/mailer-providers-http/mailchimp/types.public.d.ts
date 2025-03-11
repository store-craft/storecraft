export { MailChimp } from './adapter.js';

/**
 * @description `Mailchimp` config
 */
export type Config = {

  /**
   * @description Your API Key, if missing, it will be inferred from environment variable `MAILCHIMP_API_KEY`
   */
  apikey?: string,

};

