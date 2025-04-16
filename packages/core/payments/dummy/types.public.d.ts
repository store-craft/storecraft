import { type DummyPaymentData } from './types.private.js';
export { DummyPayments } from './index.js';

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
   * @default 'AUTHORIZE'
   */
  intent_on_checkout?: 'AUTHORIZE' | 'CAPTURE';

  seed?: Record<string, DummyPaymentData>
}
