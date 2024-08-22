export { DummyPayments } from './index.js';
export type { DummyPaymentData } from './index.js';

/**
 * gateway config
 */
export type Config = {
  /**
   * default currency code
   */
  default_currency_code?: string;

  /**
   * default intent to `authorize` or `capture` on order creation
   */
  intent_on_checkout?: 'AUTHORIZE' | 'CAPTURE';
}


