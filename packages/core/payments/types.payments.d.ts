import type { ApiRequest, ApiResponse } from "../rest/types.public.d.ts";
import type { 
  OrderData, PaymentGatewayAction, 
  PaymentGatewayInfo, PaymentGatewayStatus 
} from "../api/types.api.d.ts";
import { App } from "../types.public.js";


/**
 * @description A gateway `action` is a `function` recieving the 
 * **original** payment creation result and optional extra parameters
 */
export type PaymentGatewayActionHandler<CheckoutCreateResult, Extra> = 
  /**
   * @param input The original result of checkout creation in the payment gateway.
   * @param extra (Optional) extra parameters
   */
  (input: CheckoutCreateResult, extra: Extra) => Promise<PaymentGatewayStatus>;


/**
 * @description checkout complete result, I am still unsure about it, but currently
 * it holds new `payment` and `checkout` status
 */
export type OnCheckoutCompleteResult = {
  status: Partial<Omit<OrderData["status"], "fulfillment">>,
  onCheckoutComplete: any
};

/**
 * @description Webhook result
 */
export type OnWebHookResult = {
  /**
   * @description The new order `status`
   */
  status: Partial<Omit<OrderData["status"], "fulfillment">>,

  /**
   * @description The `ID` of the order, that relates to the webhook event
   */
  order_id: string
};


/**
 * @description Payment Gateway interface.
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
 * @template {any} CheckoutCreateResult The result of checkout creation type
 */
export declare interface payment_gateway<
  Config extends any=any, CheckoutCreateResult extends any=any
> {

  /** 
   * @description info of the payment gateway 
   */
  info: PaymentGatewayInfo;

  /** 
   * @description config of the gateway 
   */
  config: Config;

  /**
   * @description the eligible actions in this interface for remote invocation
   */
  actions: PaymentGatewayAction[];

  /**
   * @description Your chance to find env variables and more things
   * @param app `storecraft` app instance
   */
  onInit?: (app: App) => void;

  /**
   * @description Invoke a gateway `action`
   * @param action_handle the identifier of the `action`
   * @param extra extra parameters for the action
   */
  invokeAction(action_handle: string): 
      PaymentGatewayActionHandler<CheckoutCreateResult, any>;

  /**
   * @description Create a checkout in the gateway, return a 
   * `CreateResult` object which will be given to you subsequntially 
   * @param order store-craft order, use it to infer pricing
   */
  onCheckoutCreate: (order: Partial<OrderData>) => Promise<CheckoutCreateResult>;

  /**
   * @description Syncronous payment, customer has approved the payment, 
   * proceed to synchronous completion
   * @param checkout_create_result the result of checkout creation, 
   * use it to know the gateays order id etc..
   * @param extra_client_payload `anything` the client might send
   */
  onCheckoutComplete: (
    checkout_create_result: CheckoutCreateResult, extra_client_payload: any
  ) => Promise<OnCheckoutCompleteResult>;


  /**
   * @description (Optional) After a `checkout` is created, you can send a buy link with
   * HTML UI to a customer to complete a `checkout`.
   * @param order `storecraft` order. use the `order.payment_gateway.onCheckoutCreate`
   * to identify the gateway transaction.
   * @returns {Promise<string>} returns `html` string
   */
  onBuyLinkHtml?: (order: Partial<OrderData>) => Promise<string>

  /**
   * @description Query for the status of created payment, receive back 
   * a status object with available actions.
   * @param checkout_create_result sthe result of `onCheckoutCreate`
   */
  status: (checkout_create_result: CheckoutCreateResult) => Promise<PaymentGatewayStatus>;

  /**
   * @description Support async notifications and payments through webhooks.
   * The `webhook` is responsible for
   * - Verifying the integrity of the message
   * - Send a response to the webhook origin (success / error)
   * - Return the new `status` for the `order` so `storecraft` can save it
   * @param request HTTP `Request` object
   * @param response HTTP `Response` object
   */
  webhook?: (
    request: ApiRequest, response: ApiResponse
  ) => Promise<OnWebHookResult | undefined | null>;
}