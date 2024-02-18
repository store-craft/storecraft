import { App, CheckoutStatusEnum, DiscountApplicationEnum, 
  FulfillOptionsEnum, PaymentOptionsEnum } from "../index.js";
import { list } from "./con.discounts.logic.js";
import { get, upsert } from "./con.orders.logic.js";
import { calculate_pricing } from "./con.pricing.logic.js";
import { assert } from "./utils.func.js";
import { parse_query } from "./utils.query.js"


/**
 * @typedef {import("../types.api.js").OrderData} OrderData
 * @typedef {import("../types.api.js").DiscountType} DiscountType
 * @typedef {import("../types.payments.js").payment_gateway} payment_gateway
 */

/**
 * calculate pricing
 * @param {App} app 
 * @param {OrderData} order 
 * @returns {Promise<OrderData>}
 */
export const eval_pricing = 
  async (app, order) => {
  const discounts = await list(app, parse_query(`vql=(active:true)`));

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
    order.delivery, 
    order?.contact?.customer_id
  )

   return {
    ...order,
    pricing
   }
 }


/**
 * Create a checkout, which is a draft order
 * @param {App} app 
 * @param {OrderData} order
 * @param {string} gateway_handle chosen payment gateway
 * @returns {Promise<OrderData>}
 */
export const create_checkout = 
  async (app, order, gateway_handle) => {

  // fetch correct data from backend. we dont trust client
  order = await validate_checkout(
    app, order
  );

  // eval pricing with discounts
  order = await eval_pricing(
    app, order
  );

  /**@type {OrderData} */
  order = {
    ...order,
    status : {
      // @ts-ignore
      fulfillment: FulfillOptionsEnum.draft,
      // @ts-ignore
      payment: PaymentOptionsEnum.unpaid,
      // @ts-ignore
      checkout: CheckoutStatusEnum.unknown
    },
  }
  
  const has_pending_errors = order.validation.length > 0
  // we had reserve errors, so publish it with pricing etc..
  if(has_pending_errors) {
    return order;
  }

  const gateway = app.gateway(gateway_handle);

  assert(gateway, `gateway ${gateway_handle} not found`, 400);

  const { onCheckoutCreate } = gateway;

  // save the creation payload
  order.payment_gateway = {
    on_checkout_create: await onCheckoutCreate(order),
    gateway_handle
  };

  // @ts-ignore
  order.status.checkout = CheckoutStatusEnum.created;

  await upsert(app, order);

  return order
}


/**
 * Complete a checkout sync
 * @param {App} app 
 * @param {string} checkoutId 
 * @param {object} client_payload 
 */
export const complete_checkout = 
  async (app, checkoutId, client_payload) => {
  
  const order = await get(app, checkoutId);

  assert(order, 'checkout-not-found', 400);

  const gateway = app.gateway(order?.payment_gateway?.gateway_handle);

  assert(gateway, `gateway not found`, 400);

  const { onCheckoutComplete } = gateway;

  const status = await onCheckoutComplete(order.payment_gateway?.on_checkout_create);

  order.status = {
    ...order.status,
    ...status
  }
  
  await upsert(app, order);

  return order;
}


/**
 * fetch latest prices and shipping, soft-test for quantities
 * @param {App} app
 * @param {OrderData} checkout
 * @returns {Promise<OrderData>}
 */
export const validate_checkout = 
  async (app, checkout) => {

  const snap_shipping = await app.db.shipping.get(checkout.shipping_method.id);
  const snaps_products = await app.db.products.getBulk(
    checkout.line_items.map(li => li.id)
  );

  /**@type {import("../types.api.js").ValidationEntry[]} */
  const errors = []

  const errorWith = (id, message) => {
    errors.push({ id, message });
  }

  // assert shipping is valid
  if(!snap_shipping)
    errorWith(snap_shipping.id, 'shipping-method-not-found')
  else { // else patch the latest
    checkout.shipping_method = snap_shipping;
  }

  // assert stock
  snaps_products.forEach(
    (it, ix) => {
      if(!it) {
        errorWith(it.id, 'product-not-exists')
      } else {
        const pd = it;
        const li = checkout.line_items[ix]

        if(pd.qty==0)
          errorWith(it.id, 'product-out-of-stock')
        else if(li.qty>pd.qty)
          errorWith(it.id, 'product-not-enough-stock')

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