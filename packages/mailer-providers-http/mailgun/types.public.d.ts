export { MailerMailgun } from './index.js';

/**
 * @description `mailgun` config
 */
export type Config = {
  /** 
   * @description your mailgun api key 
   */
  apikey: string,

  /** 
   * @description your registered domain name at `mailgun` 
   */
  domain_name: string;
};

