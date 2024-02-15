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
 * @returns {Promise<OrderData>}
 */
export const create_checkout = 
  async (app, order) => {

  // fetch correct data from backend. we dont trust client
  order = await validate_checkout(
    app, order
  )

  // eval pricing with discounts
  order = await eval_pricing(
    app, order
  )

  /**@type {OrderData} */
  order = {
    ...order,
    status : {
      fulfillment: FulfillOptionsEnum.draft,
      payment: PaymentOptionsEnum.unpaid,
      checkout: CheckoutStatusEnum.unknown
    },
  }
  
  const has_pending_errors = order.validation.length > 0
  // we had reserve errors, so publish it with pricing etc..
  if(has_pending_errors) {
    return order;
  }

  // payment gateway config, maybe cache it for 1 hour
  const gateway_id = order.payment_gateway.gateway_id
  /**@type {admin.firestore.DocumentSnapshot<PaymentGatewayData>} */
  const pg_config = await db.collection('payment_gateways').doc(gateway_id).get()

  const payment_gateway_handler = await import(
    `../../gateways/${gateway_id}/index.js`
  )
  const { onCheckoutCreate } = payment_gateway_handler

  order.payment_gateway.on_checkout_create = await onCheckoutCreate(
    order, pg_config.data()
  )
  order.status.checkout = CheckoutStatusEnum.created;

  await upsert(app, order);

  return order
}


/**
 * Complete a checkout
 * @param {App} app 
 * @param {string} checkoutId 
 * @param {object} client_payload 
 */
export const complete_checkout = 
  async (app, checkoutId, client_payload) => {
  
  const order = await get(app, checkoutId);

  assert(order, 'checkout-not-found')

  const gateway_id = order.payment_gateway.gateway_id
  const pg_config = await db.collection('payment_gateways').doc(gateway_id).get()
  const gateway_handler = await import(`../../gateways/${gateway_id}/index.js`)
  const onCheckoutComplete = gateway_handler.onCheckoutComplete
  const complete = await onCheckoutComplete(
    order, pg_config.data(), 
    client_payload
  )

  order.payment_gateway.on_checkout_complete = complete;
  await upsert(app, order);

  return order
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