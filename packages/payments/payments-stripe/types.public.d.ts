export { Stripe } from './adapter.js';
import type { Stripe as StripeCls } from 'stripe'

/**
 * @description gateway config
 */
export type Config = {

  /**
   * @description `stripe` publishable key. If missing, will be inferred from env variable `STRIPE_PUBLISHABLE_KEY`
   */
  publishable_key?: string;

  /**
   * @description `stripe` private secret. If missing, will be inferred from env variable `STRIPE_SECRET_KEY`
   */
  secret_key?: string;

  /**
   * @description (Optional) `webhook` Endpoint private secret in case
   * you are configuring webhook for async payments 
   * [https://docs.stripe.com/webhooks?verify=check-signatures-library](https://docs.stripe.com/webhooks?verify=check-signatures-library).
   * 
   * If missing, will be inferred from env variable `STRIPE_WEBHOOK_SECRET`
   */
  webhook_endpoint_secret?: string;
  
  /**
   * @description config options for `stripe`
   */
  stripe_config?: StripeCls.StripeConfig;

  /**
   * @description configure `intent` creation
   */
  stripe_intent_create_params?: Omit<StripeCls.PaymentIntentCreateParams, 'amount'>;
}


