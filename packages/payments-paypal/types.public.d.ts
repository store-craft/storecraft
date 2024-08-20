export { Paypal } from './index.js';

/**
 * @description gateway config
 */
export type Config = {
  /**
   * @description default currency code
   */
  default_currency_code?: string;

  /**
   * @description the environment
   */
  env: 'prod' | 'test';

  /**
   * @description private client id
   */
  client_id: string;

  /**
   * @description private secret
   */
  secret: string;
  
  /**
   * @description default intent to `authorize` or `capture` on order creation
   */
  intent_on_checkout?: 'AUTHORIZE' | 'CAPTURE';
}


