export { Paypal } from './adapter.js';

/**
 * @description gateway config
 */
export type Config = {
  /**
   * @description default currency code
   * @default 'USD'
   */
  default_currency_code?: string;

  /**
   * @description the environment
   * @default 'prod'
   */
  env?: 'prod' | 'test';

  /**
   * @description private client id. If missing, 
   * - if `env===prod` -> will be inferred from env variable `PAYPAL_CLIENT_ID_PROD` or `PAYPAL_CLIENT_ID`
   * - if `env===test` -> will be inferred from env variable `PAYPAL_CLIENT_ID_TEST` or `PAYPAL_CLIENT_ID`
   */
  client_id?: string;

  /**
   * @description private secret. If missing, 
   * - if `env===prod` -> will be inferred from env variable `PAYPAL_SECRET_PROD` or `PAYPAL_SECRET`
   * - if `env===test` -> will be inferred from env variable `PAYPAL_SECRET_TEST` or `PAYPAL_SECRET`
   */
  secret?: string;
  
  /**
   * @description default intent to `authorize` or `capture` on order creation
   * @default 'AUTHORIZE'
   */
  intent_on_checkout?: 'AUTHORIZE' | 'CAPTURE';
}


