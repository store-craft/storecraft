export { Razorpay } from './adapter.js';

/**
 * razorpay gateway configuration
 */
export type Config = {
  /**
   * razorpay key id (public key).
   * if missing, inferred from env variable RAZORPAY_KEY_ID
   */
  key_id?: string;

  /**
   * razorpay key secret (private key).
   * if missing, inferred from env variable RAZORPAY_KEY_SECRET
   */
  key_secret?: string;

  /**
   * default currency code.
   * razorpay supports INR, USD, EUR and more.
   * @default 'INR'
   */
  default_currency_code?: string;

  /**
   * capture mode.
   * - 'manual': payment is authorized but not captured automatically,
   *   you must call the capture action explicitly.
   * - 'automatic': razorpay captures payment immediately on authorization.
   * @default 'manual'
   */
  capture_mode?: 'manual' | 'automatic';

  /**
   * optional webhook secret for verifying razorpay webhook signatures.
   * if missing, inferred from env variable RAZORPAY_WEBHOOK_SECRET.
   * for production you should always set this.
   */
  webhook_secret?: string;
};

/**
 * augments the Razorpay class declaration to expose the static EnvConfig
 * shape used by the cli compile step (compile.app.js) for env variable mapping.
 * this mirrors the pattern used by Paypal.EnvConfigProd and Stripe.EnvConfig.
 */
export declare class Razorpay {
  static EnvConfig: {
    readonly key_id: 'RAZORPAY_KEY_ID';
    readonly key_secret: 'RAZORPAY_KEY_SECRET';
  };
}