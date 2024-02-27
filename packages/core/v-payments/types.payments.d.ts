import type { OrderData } from "../v-api/types.api.js";

/**
 * Payment gateway description, logos and urls
 */
export type PaymentGatewayInfo = {
  /** description of the gateway */
  description?: string;
  /** logo url (or even data-url) of the gateway */
  logo_url?: string;
  /** url of the gateway website */
  url?: string;
}

/**
 * Upon status query, the gateway return a list of possible actions,
 * such as `void`, `capture`, `refund` etc...
 */
export type PaymentGatewayAction = {
  /** action name for display */
  name: string;
  /** action handle for invocation at backend */
  handle: string;
  /** optional description of what will happen if the action is executed */
  description?: string;
}

export type PaymentGatewayStatus = {
  /** List of possible actions to take */
  actions?: PaymentGatewayAction[];
  /** A list of messages of the current payment status, for example `150$ were authorized...` */
  messages?: string[];
}

export type OnCheckoutCompleteResult = Partial<Omit<OrderData["status"], "fulfillment">>;

/**
 * Payment Gateway interface.
 * pay attention to:
 * 1. `actions()` getter, which specifies a list eligible rpc methods
 * for invocation on this backend (for example `void`, `capture`, `refund` or whatever)
 * 
 * 2. `status()` method analyzes the current state of the payment and returns messages and
 * a list of eligible `actions` (think `void`, `capture`, `refund` or whatever) 
 * for invocation to the front end.
 * 
 * 3. `onCheckoutCreate()` method creates a payment intent at the payment provider and returns
 * a payload, which we save and on further interactions (other `actions`), we will supply it
 * back, so you can use it to save payment provider `id` in (`stripe`, `paypal` etc) and then
 * fetch it back to carry on other actions.
 * 
 * 4. `onCheckoutComplete()` method, used for syncronous payment completion (unlike async payment via webhook),
 * think, a user adds payment method and confirms at frontend and then you send a `api/checkouts/../complete` to 
 * the backend to move the payment to the desired state. Some payment providers advocate sync payments (like `paypal standard`).
 * The expected return value is `OnCheckoutCompleteResult` which is an object containing payment and checkout
 * status.
 * 
 * 5. `webhook()` method. Some payment providers advocate finalizing a payment async with webhooks (`stripe`),
 * in this case, you can implement a webhook for this and return `OnCheckoutCompleteResult`.
 * 
 */
export declare interface payment_gateway<Config extends any, CreateResult extends any> {
  /** info of the payment gateway */
  get info(): PaymentGatewayInfo;

  /** config of the gateway */
  get config(): Config;

  /**
   * the eligible actions in this interface for remote invocation
   */
  get actions(): PaymentGatewayAction[];

  /**
   * Create a checkout in the gateway, return a `CreateResult` object which
   * will be given to you subsequntially 
   * @param order store-craft order, use it to infer pricing
   * @returns 
   */
  onCheckoutCreate: (order: OrderData) => Promise<CreateResult>;

  /**
   * Syncronous payment, customer has approved the payment, proceed to synchronous completion
   * @param create_result the result of checkout creation, use it to know the gateays order id etc..
   * @returns 
   */
  onCheckoutComplete: (create_result: CreateResult) => Promise<OnCheckoutCompleteResult>;

  /**
   * Query for the status of created payment, receive back a status object with
   * available actions.
   * @param order store-craft order, use it to infer pricing
   * @returns 
   */
  status: (input: CreateResult) => Promise<PaymentGatewayStatus>;

  /**
   * Support async notifications and payments through webhooks
   * @param input input to webhook, usually HTTP request
   * @returns 
   */
  webhook?: (input: Request) => Promise<void>;
}