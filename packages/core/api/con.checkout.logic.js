/**
 * @import { 
 *  OrderData, CheckoutCreateType, 
 *  OrderDataUpsert, ValidationEntry, 
 *  CheckoutCreateTypeAfterValidation
 * } from './types.api.js';
 */
import { 
  App, CheckoutStatusEnum, DiscountApplicationEnum, 
  FulfillOptionsEnum, PaymentOptionsEnum 
} from "../index.js";
import { calculate_pricing } from "./con.pricing.logic.js";
import { enums } from "./index.js";
import { assert_zod } from "./middle.zod-validate.js";
import { checkoutCreateTypeSchema } from "./types.autogen.zod.api.js";
import { assert } from "./utils.func.js";

/**
 * @param {App} app
 */
export const validate_checkout = app =>
/**
 * @description `validate` a `checkout`:
 * 1. re-fetch latest `product` prices and `shipping`
 * 2. soft-test for quantities
 * 3. re-merge latest `products` data inside the `line-items`
 * 
 * @template {CheckoutCreateType} T
 * @param {T} checkout
 * @returns {Promise<CheckoutCreateTypeAfterValidation>
 * }
 */
async (checkout) => {

  // get shipping snapshot
  const shipping_id = checkout.shipping_method.id ?? 
    checkout.shipping_method.handle;
  const shipping_method = await app._.db.resources.shipping_methods.get(
    shipping_id
  );

  // get products snapshot
  const snaps_products = await app._.db.resources.products.getBulk(
    checkout.line_items.map(li => li.id)
  );

  // console.log('snaps_products', snaps_products)

  /**@type {ValidationEntry[]} */
  const errors = [];

  /**
   * @param {string} id 
   * @param {ValidationEntry["message"]} message 
   * @param {ValidationEntry["code"]} code 
   */
  const errorWith = (id, message, code) => {
    errors.push(
      { id, message, code, extra: { id } }
    );
  }

  // assert shipping is valid
  if(!shipping_method) {
    errorWith(
      shipping_id, 
      `Shipping Method \`${shipping_id}\` not found`,
      'shipping-method-not-found'
    );
  }

  // assert stock
  snaps_products.forEach(
    (it, ix) => {
      const li = checkout.line_items[ix];

      if(!it) {
        errorWith(
          li?.id, 
          `Product \`${li?.data?.title ?? li?.id}\` not found`,
          'product-not-exists'
        );
      } else {
        const pd = it;
        const li = checkout.line_items[ix];

        if(pd.qty==0) {
          errorWith(
            pd?.id, 
            `Product \`${pd?.title ?? pd?.id}\` is out of stock`, 
            'product-out-of-stock'
          );
        }
        else if(li.qty>pd.qty) {
          errorWith(
            pd?.id, 
            `Product \`${pd?.title ?? pd?.id}\` has **${pd?.qty}** in stock, ` + 
            'try to lower the quantity',
            'product-not-enough-stock'
          );
        }
        
        if(!pd.active) {
          errorWith(
            pd.id, 
            `Product \`${pd.title}\` is inactive`,
            'product-inactive'
          );
        }

        // patch line items inline
        li.data = pd;
        li.price = pd.price;
        li.stock_reserved = 0;
      }
    }
  );

  return {
    ...checkout, 
    shipping_method,
    validation: errors 
  }

}

/**
 * @param {App} app 
 */
export const eval_pricing = (app) => 
/**
 * @description Calculate `pricing`:
 * 1. Fetch **active** `discounts`
 * 2. Fetch `coupons` used
 * 3. calculate `pricing`
 * 4. return the `order` with `pricing` information
 * 
 * @template {CheckoutCreateTypeAfterValidation} T
 * @param {T} order 
 * @returns {Promise<T & { pricing: OrderData["pricing"] } >}
 */
async (order) => {
  const discounts = await app.api.discounts.list(
    {
      limit: 1000,
      vql: {
        active: {
          $eq: true
        }
      }
    }
  );

  const auto_discounts = discounts.filter(
    it => it.application.id===DiscountApplicationEnum.Auto.id
  );
  const manual_discounts = discounts.filter(
    it => it.application.id===DiscountApplicationEnum.Manual.id
  ).filter(
    d => order.coupons.find(
      c => (
        (c.handle===d.handle) ||
        (c.id===d.id)
      )
    )!==undefined
  );

  const pricing = await calculate_pricing(
    order.line_items, 
    auto_discounts, 
    manual_discounts, 
    order.shipping_method, 
    order.address,
    order?.contact?.customer_id,
    app._.taxes
  );

  // console.log(pricing)

  return {
    ...order,
    pricing
  }
}

/**
 * @template {App} T
 * @param {T} app 
 */
export const validation_and_pricing = app =>
/**
 * @description Create a quick validation and pricing of a checkout.
 * This should be used by frontents to show the user the pricing and 
 * validation of a cart and checkout while the customer hasn't created
 * a checkout yet.
 * @param {CheckoutCreateType} order_checkout
 * @returns {Promise<Partial<Pick<OrderData, "pricing" | "validation">>>}
 */
async (order_checkout) => {

  assert_zod(
    checkoutCreateTypeSchema.transform(x => x ?? undefined), 
    order_checkout
  );

  // order_checkout.line_items.push(
  //   {
  //     id: 'dddd'
  //   },
  // );
  // order_checkout.shipping_method = {
  //   id: 'diojsidj'
  // }

  // fetch correct data from backend. we dont trust client
  const order_validated = await validate_checkout(app)(order_checkout);
  const validation = order_validated.validation;

  // we had reserve errors, so publish it without pricing etc..
  if(validation.length > 0) {
    return {
      validation,
    }
  }

  // eval pricing with discounts
  const order_priced = await eval_pricing(app)(order_validated);

  return {
    pricing: order_priced.pricing,
  };
}


/**
 * @template {App} T
 * @param {T} app 
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
 * @param {CheckoutCreateType} order_checkout
 * @param {keyof T["__show_me_everything"]["gateways"]} gateway_handle chosen payment gateway
 * @returns {Promise<Partial<OrderData>>}
 */
async (order_checkout, gateway_handle) => {

  const handle = /** @type {string} */ (gateway_handle);
  assert_zod(
    checkoutCreateTypeSchema.transform(x => x ?? undefined), 
    order_checkout
  );

  // get gateway and verify
  const gateway = app.__show_me_everything.gateways?.[handle];

  assert(gateway, `gateway ${handle} not found`, 400);

  // fetch correct data from backend. we dont trust client
  const order_validated = await validate_checkout(app)(order_checkout);
  
  const has_pending_errors = order_validated.validation.length > 0;

  // we had reserve errors, so publish it with pricing etc..
  if(has_pending_errors) {
    return order_validated;
  }

  // eval pricing with discounts
  const order_priced = await eval_pricing(app)(order_validated);

  /**@type {OrderDataUpsert} */
  const order = {
    ...order_priced,
    status : {
      fulfillment: FulfillOptionsEnum.draft,
      payment: PaymentOptionsEnum.unpaid,
      checkout: CheckoutStatusEnum.unknown
    },
  }
  
  // reserve stock
  if(app.config.checkout_reserve_stock_on==='checkout_create') {
    await reserve_stock_of_order(app, order);
  }

  const on_checkout_create = await gateway.onCheckoutCreate(order);

  // save the creation payload
  order.payment_gateway = {
    on_checkout_create,
    gateway_handle: handle,
    latest_status: await gateway.status(on_checkout_create)
  };

  order.status.checkout = CheckoutStatusEnum.created;

  // console.log('order', order)

  // return order;
  const id = await app.api.orders.upsert(order);

  order.id = id;

  return order;
}


/**
 * @description Reserve stock of an order
 * @param {App} app 
 * @param {OrderDataUpsert} order 
 */
const reserve_stock_of_order = async (app, order) => {
  await app.api.products.changeStockOfBy(
    order.line_items.map(li => li.id),
    order.line_items.map(li => -li.qty)
  );

  order.line_items = order.line_items.map(
    li => (
      {
        ...li,
        stock_reserved: li.qty,
      }
    )
  );

  order.status.fulfillment = enums.FulfillOptionsEnum.processing;
}


/**
 * @description Complete a checkout syncronously
 * 
 * @param {App} app 
 */
export const complete_checkout = app =>
/**
 * 
 * @description Complete a `checkout` syncronously:
 * 1. find the payment gateway and corresponding order.
 * 2. invoke `onCheckoutComplete` hook of the gateway
 * 3. update the `order` payment and checkout `status`
 * 4. change stock automatically if configured so
 * 5. `upsert` the order with the new `status`
 * 
 * @param {string} checkoutId 
 * @param {object} client_payload 
 */
async (checkoutId, client_payload) => {
  
  const order = await app.api.orders.get(checkoutId);

  assert(order, 'checkout-not-found', 400);

  const gateway = app.__show_me_everything.gateways?.[
    order?.payment_gateway?.gateway_handle
  ]

  assert(gateway, `gateway not found`, 400);

  const on_checkout_complete = await gateway.onCheckoutComplete(
    order.payment_gateway?.on_checkout_create, client_payload
  );
  
  { // we need to validate status is in correct format
    if(on_checkout_complete?.status?.checkout) {
      assert(
        (typeof on_checkout_complete.status.checkout.id)==='number', 
        '`on_checkout_complete.status.checkout.id` is not a number'
      )
    }
    if(on_checkout_complete?.status?.checkout) {
      assert(
        (typeof on_checkout_complete.status.payment.id)==='number', 
        '`on_checkout_complete.status.payment.id` is not a number'
      )
    }
  }

  order.status = {
    ...order.status,
    ...on_checkout_complete.status
  }

  order.payment_gateway.latest_status = await gateway.status(
    order.payment_gateway?.on_checkout_create
  );

  order.payment_gateway.on_checkout_complete = on_checkout_complete.onCheckoutComplete;

  if(
      (order.status.checkout.id===enums.CheckoutStatusEnum.complete.id) &&
      (app.config.checkout_reserve_stock_on==='checkout_complete')
  ) {
    await reserve_stock_of_order(app, order);
  }
  
  await app.api.orders.upsert(order);

  return order;
}


/**
 * @template {App} T
 * @param {T} app 
 */
export const inter = app => {

  return {
    eval_pricing: eval_pricing(app),
    validation_and_pricing: validation_and_pricing(app),
    validate_checkout: validate_checkout(app),
    create_checkout: create_checkout(app),
    complete_checkout: complete_checkout(app),
  }
}