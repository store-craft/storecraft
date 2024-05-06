import { 
  App, CheckoutStatusEnum, DiscountApplicationEnum, 
  FulfillOptionsEnum, PaymentOptionsEnum } from "../index.js";
import { calculate_pricing } from "./con.pricing.logic.js";
import { enums } from "./index.js";
import { assert } from "./utils.func.js";
import { parse_query } from "./utils.query.js"


/**
 * @typedef {import("./types.api.js").OrderData} OrderData
 * @typedef {import("./types.api.js").DiscountType} DiscountType
 * @typedef {import("../v-payments/types.payments.js").payment_gateway} payment_gateway
 */


/**
 * 
 * 
 * @template {import("../index.js").db_driver} D
 * @template {import("../index.js").storage_driver} E
 * @template {Record<string, payment_gateway>} F
 * 
 * 
 * @param {App<any, any, any, D, E, F>} app
 */
export const validate_checkout = app =>
/**
 * 
 * @description `validate` a `checkout`:
 * 1. re-fetch latest `product` prices and `shipping`
 * 2. soft-test for quantities
 * 3. re-merge latest `products` data inside the `line-items`
 * 
 * 
 * @template {import("./types.api.js").CheckoutCreateType} T
 * 
 * 
 * @param {T} checkout
 * 
 * 
 * @returns {Promise<T & { validation: OrderData["validation"]}>}
 */
async (checkout) => {

  const shipping_id = checkout.shipping_method.id ?? checkout.shipping_method.handle;
  const snap_shipping = await app.db.resources.shipping.get(
    shipping_id
  );

  const snaps_products = await app.db.resources.products.getBulk(
    checkout.line_items.map(li => li.id)
  );

  /**@type {import("./types.api.js").ValidationEntry[]} */
  const errors = [];

  /**
   * 
   * @param {string} id 
   * @param {import("./types.api.js").ValidationEntry["message"]} message 
   */
  const errorWith = (id, message) => {
    errors.push({ id, message });
  }

  // assert shipping is valid
  if(!snap_shipping)
    errorWith(shipping_id, 'shipping-method-not-found')
  else { // else patch the latest
    checkout.shipping_method = snap_shipping;
  }

  // assert stock
  snaps_products.forEach(
    (it, ix) => {
      const li = checkout.line_items[ix];

      if(!it) {
        errorWith(li?.id, 'product-not-exists')
      } else {
        const pd = it;
        const li = checkout.line_items[ix]

        if(pd.qty==0)
          errorWith(it?.id, 'product-out-of-stock')
        else if(li.qty>pd.qty)
          errorWith(it?.id, 'product-not-enough-stock')

        // patch line items inline
        li.data = pd
        li.price = pd.price
        li.stock_reserved = 0
      }
    }
  )

  return {
    ...checkout, 
    validation: errors 
  }

}



/**
 * @description calculate pricing with `discounts`, `shipping`, `coupons`
 * 
 * 
 * @template {import("../index.js").db_driver} D
 * @template {import("../index.js").storage_driver} E
 * @template {Record<string, payment_gateway>} [F=Record<string, payment_gateway>]
 * 
 * 
 * @param {App<any, any, any, D, E, F>} app 
 */
export const eval_pricing = (app) => 
/**
 * @description Calculate `pricing`:
 * 1. Fetch **active** `discounts`
 * 2. Fetch `coupons` used
 * 3. calculate `pricing`
 * 4. return the `order` with `pricing` information
 * 
 * @template {import("./types.api.js").CheckoutCreateType} T
 * 
 * 
 * @param {T} order 
 * 
 * 
 * @returns {Promise<T & { pricing: OrderData["pricing"] } >}
 */
async (order) => {
  const discounts = await app.api.discounts.list(parse_query(`vql=(active:true)`));

  const auto_discounts = discounts.filter(
    it => it.application.id===DiscountApplicationEnum.Auto.id
  );
  const manual_discounts = discounts.filter(
    it => it.application.id===DiscountApplicationEnum.Manual.id
  ).filter(
    d => order.coupons.find(c => c.handle===d.handle)!==undefined
  );

  const pricing = calculate_pricing(
    order.line_items, 
    auto_discounts, 
    manual_discounts, 
    order.shipping_method, 
    order?.contact?.customer_id
  );

  return {
    ...order,
    pricing
  }
}


/**
 * 
 * @template {import("../index.js").db_driver} D
 * @template {import("../index.js").storage_driver} E
 * @template {Record<string, payment_gateway>} [F=Record<string, payment_gateway>]
 * 
 * @param {App<any, any, any, D, E, F>} app 
 */
export const create_checkout = app =>
/**
 * 
 * @description Create a `checkout`, which is a `draft` order, with the following stages:
 * 1. `validate` the checkout
 *  - if `invalid` return the `errors` in `validation` property
 * 2. `evaluate` pricing with `discounts`, `shipping` and `coupons`
 * 3. update appropriate `status`
 * 4. invoke the `onCheckoutCreate` hook on the `payment-gateway`
 * 5. `upsert` the draft `order` into the database.
 * 
 * 
 * @param {import("./types.api.js").CheckoutCreateType} order_checkout
 * @param {keyof F} gateway_handle chosen payment gateway
 * 
 * 
 * @returns {Promise<OrderData>}
 */
async (order_checkout, gateway_handle) => {

  // get gateway and verify
  const gateway = app.gateway(gateway_handle);

  assert(gateway, `gateway ${String(gateway_handle)} not found`, 400);

  // fetch correct data from backend. we dont trust client
  const order_validated = await validate_checkout(app)(order_checkout);
  
  // eval pricing with discounts
  const order_priced = await eval_pricing(app)(order_validated);
  
  /**@type {OrderData} */
  const order = {
    ...order_priced,
    status : {
      // @ts-ignore
      fulfillment: FulfillOptionsEnum.draft,
      // @ts-ignore
      payment: PaymentOptionsEnum.unpaid,
      // @ts-ignore
      checkout: CheckoutStatusEnum.unknown
    },
  }
  
  const has_pending_errors = order.validation.length > 0;

  // we had reserve errors, so publish it with pricing etc..
  if(has_pending_errors) {
    return order;
  }

  { // reserve stock
    if(app.config.checkout_reserve_stock_on==='checkout_create') {
      await app.api.products.changeStockOf(
        order.line_items.map(li => li.id),
        order.line_items.map(li => li.qty)
      )
    }
  }

  const on_checkout_create = await gateway.onCheckoutCreate(order);

  // save the creation payload
  order.payment_gateway = {
    on_checkout_create,
    gateway_handle: String(gateway_handle),
    latest_status: await gateway.status(on_checkout_create)
  };

  // @ts-ignore
  order.status.checkout = CheckoutStatusEnum.created;

  const id = await app.api.orders.upsert(order);

  return {
    ...order,
    id
  }
}


/**
 * Complete a checkout sync
 * 
 * @param {App} app 
 */
export const complete_checkout = app =>
/**
 * 
 * @description Complete a `checkout`:
 * 1. find the payment gateway and corresponding order.
 * 2. invoke `onCheckoutComplete` hook of the gateway
 * 3. update the `order` payment and checkout `status`
 * 4. change stock automatically if configured so
 * 5. `upsert` the order with the new `status`
 * 
 * 
 * @param {string} checkoutId 
 * @param {object} client_payload 
 */
async (checkoutId, client_payload) => {
  
  const order = await app.api.orders.get(checkoutId);

  assert(order, 'checkout-not-found', 400);

  const gateway = app.gateway(
    order?.payment_gateway?.gateway_handle
  );

  assert(gateway, `gateway not found`, 400);

  const order_status = await gateway.onCheckoutComplete(
    order.payment_gateway?.on_checkout_create, client_payload
  );

  order.status = {
    ...order.status,
    ...order_status
  }

  order.payment_gateway.latest_status = await gateway.status(
    order.payment_gateway?.on_checkout_create
  );

  if(
      (order.status.checkout.id===enums.CheckoutStatusEnum.complete.id) &&
      (app.config.checkout_reserve_stock_on==='checkout_complete')
  ) {

    await app.api.products.changeStockOfBy(
      order.line_items.map(li => li.id),
      order.line_items.map(li => li.qty)
    );

    order.status.fulfillment = enums.FulfillOptionsEnum.processing;
  }
  
  await app.api.orders.upsert(order);

  return order;
}


/**
 * 
 * @template {import("../index.js").db_driver} [D=any]
 * @template {import("../index.js").storage_driver} [E=any]
 * @template {Record<string, payment_gateway>} [F=any]
 * 
 * 
 * @param {App<any,any,any,D,E,F>} app 
 */
export const inter = app => {

  return {
    eval_pricing: eval_pricing(app),
    validate_checkout: validate_checkout(app),
    create_checkout: create_checkout(app),
    complete_checkout: complete_checkout(app),
  }
}