export * from './index.js';

/**
 * gateway config
 */
export type Config = {
  /**
   * default currency code
   */
  default_currency_code?: string;

  /**
   * the environment
   */
  env: 'prod' | 'test';

  /**
   * private client id
   */
  client_id: string;

  /**
   * private secret
   */
  secret: string;
  
  /**
   * default intent to `authorize` or `capture` on order creation
   */
  intent_on_checkout?: 'AUTHORIZE' | 'CAPTURE';
}


