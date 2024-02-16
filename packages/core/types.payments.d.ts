import type { OrderData } from "./types.api.d.ts";

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
  /** A description of the current payment status, for example `150$ were authorized...` */
  status: string;
}

export type OnCheckoutCompleteResult = Partial<Omit<OrderData["status"], "fulfillment">>;

/**
 * Basic collection or table
 */
export declare interface payment_gateway<Config, CreateResult extends any> {

  get config(): Config;
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
  webhook: (input: Request) => Promise<void>;
}