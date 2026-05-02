/**
 * @import { Config } from './types.public.js'
 * @import { CheckoutCreateResult, razorpay_order, razorpay_payment, razorpay_refund } from './types.private.js'
 * @import { OrderData, PaymentGatewayStatus } from '@storecraft/core/api'
 * @import { payment_gateway } from '@storecraft/core/payments'
 */

import {
  CheckoutStatusEnum,
  PaymentOptionsEnum,
} from "@storecraft/core/api/types.api.enums.js";
import { StorecraftError } from "@storecraft/core/api/utils.func.js";
import {
  fetch_razorpay,
  throw_bad_response,
  to_razorpay_amount,
  verify_webhook_signature,
} from "./adapter.utils.js";
import html_buy_ui from "./adapter.html.js";

/**
 * @typedef {payment_gateway<Config, CheckoutCreateResult>} Impl
 */

/**
 * razorpay payment gateway for storecraft.
 * supports:
 * - create checkout (razorpay order creation)
 * - synchronous completion (onCheckoutComplete with signature verification)
 * - webhook-based async completion
 * - capture, refund actions
 * - buy link html with razorpay standard checkout ui
 *
 * @implements {Impl}
 */
export class Razorpay {
  /**
   * env variable names for key_id and key_secret,
   * used in onInit if config values are not explicitly provided
   */
  static EnvConfig = /** @type {const} */ ({
    key_id: "RAZORPAY_KEY_ID",
    key_secret: "RAZORPAY_KEY_SECRET",
  });

  /** @type {Config} */
  #_config;

  /**
   * @param {Config} config
   */
  constructor(config = {}) {
    this.#_config = {
      default_currency_code: "INR",
      capture_mode: "manual",
      ...config,
    };
  }

  /**
   * called by storecraft during app initialization.
   * reads key_id and key_secret from env if not set in config.
   * @type {Impl["onInit"]}
   */
  onInit = (app) => {
    this.#_config.key_id ??= app.env[Razorpay.EnvConfig.key_id];
    this.#_config.key_secret ??= app.env[Razorpay.EnvConfig.key_secret];

    const is_valid = this.#_config.key_id && this.#_config.key_secret;

    if (!is_valid) {
      throw new StorecraftError(
        `payment gateway ${this.info?.name ?? "razorpay"} has invalid config. ` +
          `missing key_id or key_secret. ` +
          `set them in config or via env variables RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET`,
      );
    }
  };

  /** @type {Impl["info"]} */
  get info() {
    return {
      name: "Razorpay",
      description:
        "razorpay payment gateway, popular in india and south asia. supports upi, netbanking, cards, and wallets.",
      url: "https://razorpay.com",
      logo_url: "https://razorpay.com/favicon.png",
    };
  }

  get config() {
    return this.#_config;
  }

  /** @type {Impl["actions"]} */
  get actions() {
    return [
      {
        handle: "capture",
        name: "Capture",
        description: "capture an authorized payment",
      },
      {
        handle: "refund",
        name: "Refund",
        description: "refund a captured payment",
      },
    ];
  }

  /**
   * returns the action handler function for the given handle, or undefined
   * if the handle is not recognised. storecraft calls this to look up
   * gateway-specific actions (capture, refund) before executing them.
   *
   * @type {Impl["invokeAction"]}
   */
  invokeAction(action_handle) {
    switch (action_handle) {
      case "capture":
        return this.capture.bind(this);
      case "refund":
        return this.refund.bind(this);
      default:
        return /** @type {any} */ (undefined);
    }
  }

  /**
   * generates the razorpay standard checkout html page for embedding in the
   * storefront iframe. reads the checkout create result that was stored on the
   * order during onCheckoutCreate and passes it to the html template together
   * with the public key id so the browser can initialise razorpay.js.
   *
   * @param {Partial<import('@storecraft/core/api').OrderData>} order
   * @returns {Promise<string>}
   */
  async onBuyLinkHtml(order) {
    /** @type {CheckoutCreateResult} */
    const checkout_create_result = order?.payment_gateway?.on_checkout_create;
    return html_buy_ui(this.config, order, checkout_create_result);
  }

  /**
   * creates a razorpay order and returns the checkout create result.
   * storecraft stores this result and passes it back in all future interactions.
   *
   * razorpay amounts are in the smallest currency unit (paise for INR).
   * https://razorpay.com/docs/api/orders/create/
   *
   * @type {Impl["onCheckoutCreate"]}
   */
  async onCheckoutCreate(order) {
    const { default_currency_code: currency, capture_mode } = this.config;

    if (!order.pricing?.total) {
      throw new StorecraftError(
        "razorpay: order pricing or total is missing, cannot create razorpay order",
      );
    }

    const body = {
      amount: to_razorpay_amount(order.pricing.total),
      currency: currency,
      receipt: order.id,
      notes: {
        storecraft_order_id: order.id,
      },
      /**
       * payment_capture=1 means razorpay captures immediately on authorization.
       * payment_capture=0 means the merchant must call capture manually after
       * the payment reaches authorized status.
       */
      payment_capture: capture_mode === "automatic" ? 1 : 0,
    };

    const response = await fetch_razorpay(this.config, "orders", {
      method: "POST",
      body: JSON.stringify(body),
    });

    await throw_bad_response(response);

    /** @type {razorpay_order} */
    const razorpay_order = await response.json();

    if (!order.id) {
      throw new StorecraftError(
        "razorpay: order id is missing, cannot create razorpay order",
      );
    }

    if (!this.config.key_id) {
      throw new StorecraftError(
        "razorpay: key_id is not configured. set it in config or via env variable RAZORPAY_KEY_ID",
      );
    }

    /** @type {CheckoutCreateResult} */
    const result = {
      razorpay_order_id: razorpay_order.id,
      storecraft_order_id: order.id,
      amount: razorpay_order.amount,
      currency: razorpay_order.currency,
      key_id: this.config.key_id,
    };

    return result;
  }

  /**
   * handles synchronous checkout completion.
   * called when the client submits the razorpay payment response
   * (razorpay_payment_id, razorpay_order_id, razorpay_signature) to
   * POST /api/checkout/:order_id/complete.
   *
   * we verify the payment signature here to ensure the payment is legitimate.
   * https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/build-integration/#14-verify-payment-signature
   *
   * @type {Impl["onCheckoutComplete"]}
   */
  async onCheckoutComplete(checkout_create_result, extra_client_payload) {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      extra_client_payload ?? {};

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      throw new StorecraftError(
        "razorpay: missing razorpay_payment_id, razorpay_order_id or razorpay_signature in payload",
      );
    }

    /**
     * signature verification:
     * razorpay signs razorpay_order_id + '|' + razorpay_payment_id with key_secret
     */
    const body_to_sign = `${razorpay_order_id}|${razorpay_payment_id}`;
    if (!this.config.key_secret) {
      throw new StorecraftError(
        "razorpay: key_secret is not configured. set it in config or via env variable RAZORPAY_KEY_SECRET",
      );
    }

    const is_valid = await verify_webhook_signature(
      body_to_sign,
      razorpay_signature,
      this.config.key_secret,
    );

    if (!is_valid) {
      throw new StorecraftError(
        "razorpay: payment signature verification failed. possible tampering.",
      );
    }

    /**
     * fetch the payment from razorpay to confirm its current status
     */
    const payment = await this.#fetch_payment(razorpay_payment_id);

    let status;

    if (payment.status === "authorized") {
      status = {
        payment: PaymentOptionsEnum.authorized,
        checkout: CheckoutStatusEnum.complete,
      };
    } else if (payment.status === "captured") {
      status = {
        payment: PaymentOptionsEnum.captured,
        checkout: CheckoutStatusEnum.complete,
      };
    } else {
      status = {
        checkout: CheckoutStatusEnum.failed,
      };
    }

    return {
      status,
      onCheckoutComplete: payment,
    };
  }

  /**
   * handles async webhook notifications from razorpay. razorpay posts events
   * to this endpoint for payment.authorized, payment.captured, payment.failed,
   * and refund.processed. storecraft calls this method and expects either a
   * status update object or null when the event type is not relevant.
   *
   * signature verification is performed when webhook_secret is configured.
   * for production deployments always configure the webhook secret via the
   * razorpay dashboard and set it as env variable RAZORPAY_WEBHOOK_SECRET.
   * skipping verification is only acceptable during local development.
   *
   * @param {import('@storecraft/core/rest').ApiRequest} request
   * @param {import('@storecraft/core/rest').ApiResponse} response
   * @returns {Promise<import('@storecraft/core/payments').OnWebHookResult | null | undefined>}
   */
  async webhook(request, response) {
    const raw_body = (await request.text?.()) ?? "";

    const signature = request.headers?.get?.("x-razorpay-signature") ?? null;

    /**
     * webhook_secret is optional. if not set we skip signature verification.
     * for production, always set it via env variable RAZORPAY_WEBHOOK_SECRET.
     */
    const webhook_secret =
      this.config.webhook_secret ??
      (typeof process !== "undefined"
        ? process.env?.RAZORPAY_WEBHOOK_SECRET
        : undefined);

    if (webhook_secret && signature) {
      const is_valid = await verify_webhook_signature(
        raw_body,
        signature,
        webhook_secret,
      );
      if (!is_valid) {
        throw new StorecraftError(
          "razorpay webhook: signature verification failed",
        );
      }
    }

    const event = JSON.parse(raw_body);
    const event_type = event?.event;
    const payment = event?.payload?.payment?.entity;
    const order_id_in_notes = payment?.notes?.storecraft_order_id;

    if (!order_id_in_notes) {
      throw new StorecraftError(
        "razorpay webhook: storecraft_order_id not found in payment notes",
      );
    }

    let status;

    switch (event_type) {
      case "payment.authorized":
        status = {
          payment: PaymentOptionsEnum.authorized,
          checkout: CheckoutStatusEnum.complete,
        };
        break;
      case "payment.captured":
        status = {
          payment: PaymentOptionsEnum.captured,
          checkout: CheckoutStatusEnum.complete,
        };
        break;
      case "payment.failed":
        status = {
          checkout: CheckoutStatusEnum.failed,
        };
        break;
      case "refund.processed":
        status = {
          payment: PaymentOptionsEnum.refunded,
          checkout: CheckoutStatusEnum.complete,
        };
        break;
      default:
        return null;
    }

    return {
      status,
      order_id: order_id_in_notes,
    };
  }

  /**
   * fetches the current status of the razorpay order and its payments,
   * returns a human-readable status with available actions.
   * @type {Impl["status"]}
   */
  async status(checkout_create_result) {
    const { razorpay_order_id } = checkout_create_result;

    /**
     * fetch the razorpay order for top-level status
     */
    const order_response = await fetch_razorpay(
      this.config,
      `orders/${razorpay_order_id}`,
      { method: "GET" },
    );

    await throw_bad_response(order_response);

    /** @type {razorpay_order} */
    const order = await order_response.json();

    /**
     * also fetch the payments for this order so we can show
     * payment-level status (authorized, captured, refunded, failed)
     * in addition to the order-level status.
     * this endpoint returns { entity, count, items: razorpay_payment[] }
     */
    const payments_response = await fetch_razorpay(
      this.config,
      `orders/${razorpay_order_id}/payments`,
      { method: "GET" },
    );

    /** @type {razorpay_payment[]} */
    let payments = [];

    if (payments_response.ok) {
      const payments_data = await payments_response.json();
      payments = payments_data?.items ?? [];
    }

    /** @type {PaymentGatewayStatus} */
    const stat = {
      messages: [],
      actions: this.actions,
    };

    const amount_display = (order.amount / 100).toFixed(2);

    const order_messages = /** @type {string[]} */ (
      [
        `razorpay order \`${order.id}\` for **${amount_display} ${order.currency}** is in status \`${order.status}\``,
        order.status === "created" && `no payment attempt yet`,
        order.status === "attempted" &&
          `${order.attempts} payment attempt(s) made, waiting for capture`,
        order.status === "paid" && `order has been fully paid`,
      ].filter(Boolean)
    );

    const payment_messages = payments.map((p) => {
      const p_amount = (p.amount / 100).toFixed(2);
      const p_refunded =
        p.amount_refunded > 0
          ? `, refunded **${(p.amount_refunded / 100).toFixed(2)} ${p.currency}**`
          : "";
      return `payment \`${p.id}\` via \`${p.method}\` is \`${p.status}\` for **${p_amount} ${p.currency}**${p_refunded}`;
    });

    stat.messages = [...order_messages, ...payment_messages];

    return stat;
  }

  // actions

  /**
   * captures an authorized payment.
   * only relevant when capture_mode is 'manual'.
   * razorpay requires amount and currency to be passed to the capture endpoint.
   * https://razorpay.com/docs/api/payments/capture/
   *
   * @param {CheckoutCreateResult} checkout_create_result
   */
  async capture(checkout_create_result) {
    const { razorpay_order_id } = checkout_create_result;

    /**
     * we fetch the authorized payment first to get its exact amount and currency.
     * razorpay requires the capture amount to exactly equal the authorized amount.
     * using the amount from the order (checkout_create_result) could diverge if
     * razorpay applied any adjustments, so we always use payment.amount instead.
     */
    const payment =
      await this.#fetch_authorized_payment_for_order(razorpay_order_id);

    const response = await fetch_razorpay(
      this.config,
      `payments/${payment.id}/capture`,
      {
        method: "POST",
        body: JSON.stringify({
          amount: payment.amount,
          currency: payment.currency,
        }),
      },
    );

    await throw_bad_response(response);

    return this.status(checkout_create_result);
  }

  /**
   * refunds a captured payment.
   * by default, issues a full refund. partial refunds are not exposed here.
   * https://razorpay.com/docs/api/refunds
   *
   * @param {CheckoutCreateResult} checkout_create_result
   */
  async refund(checkout_create_result) {
    const { razorpay_order_id, storecraft_order_id } = checkout_create_result;

    const payment =
      await this.#fetch_captured_payment_for_order(razorpay_order_id);

    /**
     * we generate a deterministic idempotency key from the payment id so that
     * retrying this action on network failure does not create a double refund.
     * razorpay requires the key to be at least 10 characters, alphanumeric
     * with hyphens and underscores only.
     * using payment id directly satisfies all those constraints since razorpay
     * payment ids are always longer than 10 characters.
     */
    const idempotency_key = `refund-${payment.id}`;

    const response = await fetch_razorpay(
      this.config,
      `payments/${payment.id}/refund`,
      {
        method: "POST",
        headers: {
          "X-Refund-Idempotency": idempotency_key,
        },
        body: JSON.stringify({
          amount: payment.amount,
          currency: payment.currency,
          speed: "normal",
          notes: {
            storecraft_order_id: storecraft_order_id,
          },
        }),
      },
    );

    await throw_bad_response(response);

    return this.status(checkout_create_result);
  }

  // private helpers

  /**
   * fetches a single payment by its razorpay payment id.
   * https://razorpay.com/docs/api/payments/
   *
   * @param {string} payment_id
   * @returns {Promise<razorpay_payment>}
   */
  async #fetch_payment(payment_id) {
    const response = await fetch_razorpay(
      this.config,
      `payments/${payment_id}`,
      { method: "GET" },
    );
    await throw_bad_response(response);
    return response.json();
  }

  /**
   * fetches all payments for a razorpay order and returns the one
   * in 'authorized' status.
   * https://razorpay.com/docs/api/orders/fetch-payments/
   *
   * @param {string} razorpay_order_id
   * @returns {Promise<razorpay_payment>}
   */
  async #fetch_authorized_payment_for_order(razorpay_order_id) {
    const response = await fetch_razorpay(
      this.config,
      `orders/${razorpay_order_id}/payments`,
      { method: "GET" },
    );
    await throw_bad_response(response);
    const data = await response.json();
    const payment = /** @type {razorpay_payment[]} */ (data?.items ?? []).find(
      (p) => p.status === "authorized",
    );
    if (!payment) {
      throw new StorecraftError(
        `razorpay: no authorized payment found for order ${razorpay_order_id}`,
      );
    }
    return payment;
  }

  /**
   * fetches all payments for a razorpay order and returns the captured one.
   *
   * @param {string} razorpay_order_id
   * @returns {Promise<razorpay_payment>}
   */
  async #fetch_captured_payment_for_order(razorpay_order_id) {
    const response = await fetch_razorpay(
      this.config,
      `orders/${razorpay_order_id}/payments`,
      { method: "GET" },
    );
    await throw_bad_response(response);
    const data = await response.json();
    const payment = /** @type {razorpay_payment[]} */ (data?.items ?? []).find(
      (p) => p.status === "captured",
    );
    if (!payment) {
      throw new StorecraftError(
        `razorpay: no captured payment found for order ${razorpay_order_id}`,
      );
    }
    return payment;
  }
}
