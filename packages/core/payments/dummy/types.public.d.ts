export { DummyPayments } from './index.js';
export type { DummyPaymentData } from './index.js';

/**
 * @description config
 */
export type Config = {
  /**
   * @description default currency code
   */
  default_currency_code?: string;

  /**
   * @description default intent to `authorize` or `capture` on order creation
   */
  intent_on_checkout?: 'AUTHORIZE' | 'CAPTURE';
}
