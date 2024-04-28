import type { 
  OrderData, PaymentGatewayAction, PaymentGatewayInfo, PaymentGatewayStatus 
} from "../v-api/types.api.js";


/**
 * @description A gateway `action` is a `function` recieving the 
 * **original** payment creation result and optional extra parameters
 * 
 */
export type PaymentGatewayActionHandler<CreateResult, Extra> = 
  /**
   * @param input The original result of checkout creation in the payment gateway.
   * @param extra (Optional) extra parameters
   */
  (input: CreateResult, extra: Extra) => Promise<PaymentGatewayStatus>;


/**
 * @description checkout complete result, I am still unsure about it, but currently
 * it holds new `payment` and `checkout` status
 */
export type OnCheckoutCompleteResult = Partial<Omit<OrderData["status"], "fulfillment">>;


/**
 * Payment Gateway interface.
 * pay attention to:
 * 1. `actions()` getter, which specifies a list eligible 
 * rpc methods for invocation on this backend (for example 
 * `void`, `capture`, `refund` or whatever)
 * 
 * 2. `status()` method analyzes the current state of the payment 
 * and returns messages and a list of eligible `actions` (think 
 * `void`, `capture`, `refund` or whatever) for invocation to the front end.
 * 
 * 3. `onCheckoutCreate()` method creates a payment intent at the 
 * payment provider and returns a payload, which we save and on further 
 * interactions (other `actions`), we will supply it back, so you can 
 * use it to save payment provider `id` in (`stripe`, `paypal` etc) and then
 * fetch it back to carry on other actions.
 * 
 * 4. `onCheckoutComplete()` method, used for syncronous payment 
 * completion (unlike async payment via webhook), think, a user adds 
 * payment method and confirms at frontend and then you send a 
 * `api/checkouts/../complete` to the backend to move the payment to 
 * the desired state. Some payment providers advocate sync payments 
 * (like `paypal standard`). The expected return value is `OnCheckoutCompleteResult`
 * which is an object containing payment and checkout status.
 * 
 * 5. `webhook()` method. Some payment providers advocate finalizing 
 * a payment async with webhooks (`stripe`), in this case, you can implement 
 * a webhook for this and return `OnCheckoutCompleteResult`.
 * 
 * @template {any} Config The config type
 * @template {any} CreateResult The result of checkout creation type
 * 
 */
export declare interface payment_gateway<
  Config extends any, CreateResult extends any
> {

  /** 
   * 
   * info of the payment gateway 
   */
  get info(): PaymentGatewayInfo;

  /** 
   * 
   * config of the gateway 
   */
  get config(): Config;

  /**
   * 
   * the eligible actions in this interface for remote invocation
   */
  get actions(): PaymentGatewayAction[];

  /**
   * 
   * @param action_handle the identifier of the `action`
   * @param extra extra parameters for the action
   */
  invokeAction<E extends any=any>(action_handle: string): 
      PaymentGatewayActionHandler<CreateResult, E>;

  /**
   * 
   * Create a checkout in the gateway, return a `CreateResult` object which
   * will be given to you subsequntially 
   * 
   * @param order store-craft order, use it to infer pricing
   * 
   */
  onCheckoutCreate: (order: OrderData) => Promise<CreateResult>;

  /**
   * 
   * Syncronous payment, customer has approved the payment, 
   * proceed to synchronous completion
   * 
   * 
   * @param create_result the result of checkout creation, 
   * use it to know the gateays order id etc..
   * 
   */
  onCheckoutComplete: (create_result: CreateResult) => Promise<OnCheckoutCompleteResult>;

  /**
   * 
   * Query for the status of created payment, receive back a status object with
   * available actions.
   * 
   * 
   * @param order store-craft order, use it to infer pricing
   */
  status: (input: CreateResult) => Promise<PaymentGatewayStatus>;

  /**
   * 
   * Support async notifications and payments through webhooks
   * 
   * 
   * @param input input to webhook, usually HTTP request
   * 
   */
  webhook?: (input: Request) => Promise<void>;
}