export * from './index.js';
import type { Stripe } from 'stripe'

/**
 * @description gateway config
 */
export type Config = {

  /**
   * @description `stripe` publishable key
   */
  publishable_key: string;

  /**
   * @description `stripe` private secret
   */
  secret_key: string;
  
  /**
   * @description config options for `stripe`
   */
  stripe_config?: Stripe.StripeConfig;

  /**
   * @description configure `intent` creation
   */
  stripe_intent_create_params?: Omit<Stripe.PaymentIntentCreateParams, 'amount'>;
}


