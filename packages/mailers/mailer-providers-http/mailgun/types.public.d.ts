export { Mailgun } from './adapter.js';

/**
 * @description `mailgun` config
 */
export type Config = {
  /**
   * @description Your API Key, if missing, it will be inferred from environment variable `MAILGUN_API_KEY`
   */
  apikey?: string,

  /** 
   * @description your registered domain name at `mailgun` 
   */
  domain_name: string;
};

