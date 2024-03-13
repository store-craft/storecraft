
/**
 * @typedef {import('./types.api.js').ProductType} ProductType
 * @typedef {import('./types.api.js').ProductTypeUpsert} ProductTypeUpsert
 * @typedef {import('./types.api.js').ShippingMethodType} ShippingMethodType
 * @typedef {import('./types.api.js').FilterMeta} FilterMeta
 * @typedef {import('./types.api.js').Filter} Filter
 * @typedef {import('./types.api.js').DiscountType} DiscountType
 * @typedef {import('./types.api.js').DiscountDetails} DiscountDetails
 * @typedef {import('./types.api.js').DiscountMeta} DiscountMeta
 * @typedef {import('./types.api.js').BulkDiscountExtra} BulkDiscountExtra
 * @typedef {import('./types.api.js').OrderDiscountExtra} OrderDiscountExtra
 * @typedef {import('./types.api.js').RegularDiscountExtra} RegularDiscountExtra
 * @typedef {import('./types.api.js').BuyXGetYDiscountExtra} BuyXGetYDiscountExtra
 * @typedef {import('./types.api.js').BundleDiscountExtra} BundleDiscountExtra
 * @typedef {import('./types.api.js').LineItem} LineItem
 * @typedef {import('./types.api.js').PricingData} PricingData
 * 
 */

import { DiscountApplicationEnum, DiscountMetaEnum, 
  FilterMetaEnum } from './types.api.enums.js';

/**
 * 
 * @param {ProductType | ProductTypeUpsert} product 
 * @param {Filter} filter 
 */
export const test_product_filter_against_product = 
  (filter, product) => {

  try {
    switch (filter.meta.op) {
      case FilterMetaEnum.p_all.op:
        return true

      case FilterMetaEnum.p_in_price_range.op:
        return (product.price>=(filter.value.from ?? 0)) && 
               (product.price<=(filter.value.to ?? Number.POSITIVE_INFINITY))

      case FilterMetaEnum.p_in_collections.op:
        return product.collections?.some(
          c => filter.value.map(v => v.id).includes(c.id)
        ) ?? false
      case FilterMetaEnum.p_not_in_collections.op:
        return product.collections?.every(
            c => !filter.value.map(v => v.id).includes(c.id)
          ) ?? true

      case FilterMetaEnum.p_in_handles.op:
        return filter.value.includes(product.handle)
      case FilterMetaEnum.p_not_in_handles.op:
        return !filter.value.includes(product.handle)

      case FilterMetaEnum.p_in_tags.op:
        return product.tags?.some(
          c => filter.value.includes(c)
        ) ?? false
      case FilterMetaEnum.p_not_in_tags.op:
        return product.tags?.every(
          c => !filter.value.includes(c)
        ) ?? true

    }
  
  } catch (e) {
    return false
  }

}

/**
 * 
 * @param {ProductType | ProductTypeUpsert} product 
 * @param {Filter[]} filters 
 */
export const test_product_filters_against_product = 
  (filters=[], product) => {

  filters = filters?.filter(
    f => f?.meta?.type==='product'
  )
  return filters.length>0 && 
    filters?.every(
      (filter) => test_product_filter_against_product(
        filter, product
      )
    )
}

/**
 * 
 * @param {Filter} filter 
 * @param {PricingData} context 
 */
const test_order_filter = 
  (filter, { uid, total, subtotal, quantity_total }) => {

  try {
    switch (filter.meta.op) {
      case FilterMetaEnum.o_date_in_range.op:
        const now = Date.now()
        return (now>=filter.value.from && now < filter.value.to)

      case FilterMetaEnum.o_has_customer.op:
        return filter.value?.includes(
          uid
        )

      case FilterMetaEnum.o_items_count_in_range.op:
        return quantity_total>=filter.value.from

      case FilterMetaEnum.o_subtotal_in_range.op:
        return subtotal>=filter.value.from
        
      default:
        return false
    }
  
  } catch (e) {
    return false
  }

}

/**
 * 
 * @param {Filter[]} filters 
 * @param {PricingData} context 
 */
const test_order_filters = 
  (filters, context) => {

  filters = filters?.filter(
    f => f.meta.type==='order'
  )
  return filters.length>0 && 
    filters.every(
      (filter) => test_order_filter(
        filter, context
      )
    )
}

/**
 * @param {number} v 
 * @param {number} a 
 * @param {number} b 
 * @returns {number}
 */
const clamp = (v, a, b) => {
  return (typeof v==='number') ? 
        Math.max(Math.min(v, b), a) :
        a
}

/**
 * 
 * @param {number} quantity integer >=0
 * @param {number} price 
 * @param {number} percent_off a number between [0..100]
 * @param {number} fixed_off a positive number >=0
 * @returns {number}
 */
const apply_discount = 
  (quantity=0, price=0, percent_off=0, fixed_off=0) => {
  
  quantity = Math.floor(Math.max(quantity, 0));
  percent_off = clamp(percent_off, 0, 100);
  fixed_off = fixed_off;

  const total_price = price * quantity;

  const total_off = (total_price * percent_off)/100 - (fixed_off * quantity);

  // console.log('quantity ', quantity)
  // console.log('price ', price)
  // console.log('percent_off ', percent_off)
  // console.log('fixed_off ', fixed_off)

  return Math.min(Math.max(total_off, 0), total_price);
}

/**
 * 
 * @param {boolean} condition 
 * @param {string} message 
 * @throws {Error} 
 */
const assert = (condition, message) => {
  if(Boolean(condition))
    return
  throw new Error(message)
}

/**
 * 
 * @param {LineItem[]} line_items 
 * @returns {number}
 */
export const lineitems_to_quantity = (line_items) => {
  return line_items.reduce((p, c) => p + c.qty, 0);
}


/**
 * 
 * @param {LineItem[]} line_items 
 * @param {PricingData} context 
 * @param {DiscountType} discount 
 * @returns {CalcDiscountResult}
 */
export const calculate_line_items_discount_with_regular_discount = 
  (line_items, discount, context) => {
  
  assert(
    discount.info.details.meta.type === DiscountMetaEnum.regular.type,
    'error:: tried to discount a non regular discount'
  )

  // mask
  const pass_mask = line_items.map(
    li => {
      return test_product_filters_against_product(
        discount?.info?.filters, li.data
        )
    }
  );

  // perform discount and compute new generation of line items
  const line_items_next = line_items.filter(
    (li, ix) => !pass_mask[ix]
  )

  const discount_details = discount?.info?.details
  /**@type {RegularDiscountExtra} */
  const discount_extra = discount_details?.extra

  const $percent = clamp(discount_extra?.percent, 0, 100) ?? 0;
  const $fixed = discount_extra?.fixed ?? 0;

  const report = line_items.filter(
    (li, ix) => pass_mask[ix]
  ).reduce(
    (p, c, ix) => {

      const qty = c.qty;
      const price = c?.data?.price ?? c.price;
      const curr = apply_discount(
        c.qty, price, $percent, $fixed
      );
      
      p.total_discount += curr;
      p.quantity_discounted += qty;

      return p;
    }, 
    {
      total_discount: 0,
      quantity_discounted : 0,
      quantity_undiscounted: lineitems_to_quantity(line_items_next)
    }
  )

  return {
    line_items_next,
    ...report
  }
  
}


/**
 * 
 * @param {LineItem[]} line_items 
 * @param {PricingData} context 
 * @param {DiscountType} discount 
 * @returns {CalcDiscountResult}
 */
export const calculate_line_items_discount_with_bulk_discount = 
  (line_items, discount, context) => {
  
  assert(
    discount.info.details.meta.type === DiscountMetaEnum.bulk.type,
    'error:: tried to discount a non bulk discount'
  )

  const discount_details = discount?.info?.details
  /**@type {BulkDiscountExtra} */
  const discount_extra = discount_details?.extra

  const $percent = clamp(discount_extra?.percent, 0, 100) ?? 0
  const $fixed = discount_extra?.fixed ?? 0
  const qty = discount_extra?.qty ?? 0
  const recursive = discount_extra?.recursive ?? false

  assert(
    qty > 0, 'bulk discount qty <= 0'
  )

  const { pass_mask, pass_quantity } = compute_pass_mask(
    line_items, discount?.info?.filters
  )

  // compute all the total quantity that is legable for the
  // discount
  const total_legal_qty = pass_quantity

  // how many legable groups/bulks do we have
  const max_bulks_can_fit =  Math.floor(total_legal_qty / qty)

  const how_many_bulks_to_fit = recursive ? 
      max_bulks_can_fit :
      Math.min(max_bulks_can_fit, 1)

  const how_many_to_reduce = how_many_bulks_to_fit * qty

  // remove how_many_fit and compute their total
  const { line_items_next, total } = reduce_from_line_items(
    line_items, how_many_to_reduce, pass_mask
  )

  const total_discount = apply_discount(
    1, total, $percent, $fixed * how_many_bulks_to_fit
    )

  return {
    line_items_next,
    total_discount,
    quantity_discounted: how_many_to_reduce,
    quantity_undiscounted: lineitems_to_quantity(line_items_next)
  }
  
}

/**
 * @typedef {object} ReduceResult
 * @property {number} how_many_left_to_reduce
 * @property {number} total total price of reduced items
 * @property {LineItem[]} line_items_next reduced line items
 * 
 * create new line items with reduced quantities
 * @param {LineItem[]} line_items 
 * @param {number} how_many_to_reduce 
 * @param {boolean[]} pass_mask 
 * @returns {ReduceResult}
 */
const reduce_from_line_items = 
  (line_items, how_many_to_reduce, pass_mask) => {

  const line_items_next = line_items.map(
    li => ({ ...li })
    )

  return line_items_next.reduce(
    (p, c, ix) => {
      if(!pass_mask[ix])
        return p
      
      const reduce_count = Math.min(
        p.how_many_left_to_reduce,
        c.qty
      )
      const reduced_total = reduce_count * (c.price ?? c.data.price)

      p.how_many_left_to_reduce -= reduce_count
      p.total += reduced_total

      // reduce
      c.qty -= reduce_count

      return p
    }
    , { 
      how_many_left_to_reduce: how_many_to_reduce,
      total: 0,
      line_items_next
    }
  )
}

/**
 * @typedef {object} PassResult
 * @property {boolean[]} pass_mask
 * @property {number} pass_quantity how many quantities pass the filters
 * @property {number} pass_total_quantity total quantities of line items
 * 
 * @param {LineItem[]} line_items line items to inspect
 * @param {Filter[]} filters filters
 * @return {PassResult}
 */
const compute_pass_mask = (line_items=[], filters=[]) => {
  return line_items.reduce(
    (p, c, ix) => {
      const pass = test_product_filters_against_product(
        filters, c.data
      )

      p.pass_mask.push(pass);
      p.pass_quantity += (pass ? c.qty : 0);
      p.pass_total_quantity += c.qty;

      return p
    }, {
      pass_mask: [],
      pass_quantity: 0,
      pass_total_quantity: 0
    }

  )

}

/**
 * @typedef {object} CalcDiscountResult
 * @property {LineItem[]} line_items_next
 * @property {number} total_discount total discount given at this stage
 * @property {number} [quantity_discounted] quantity of items that were part of discount and may not be used again
 * @property {number} [quantity_undiscounted] quantity of remaining items
 */

/**
 * 
 * @param {LineItem[]} line_items 
 * @param {PricingData} context 
 * @param {DiscountType} discount 
 * @returns {CalcDiscountResult}
 */
export const calculate_line_items_discount_with_buy_x_get_y_discount = 
  (line_items, discount, context) => {
  
  assert(
    discount.info.details.meta.type === DiscountMetaEnum.buy_x_get_y.type,
    'error:: tried to discount a non buy_x_get_y discount'
  )

  const discount_details = discount?.info?.details
  /**@type {BuyXGetYDiscountExtra} */
  const discount_extra = discount_details?.extra

  const $percent = clamp(discount_extra?.percent, 0, 100) ?? 0
  const $fixed = discount_extra?.fixed ?? 0
  const qty_x = discount_extra?.qty_x ?? 0
  const qty_y = discount_extra?.qty_y ?? 0
  const recursive = discount_extra?.recursive ?? false

  /**@type {CalcDiscountResult} */
  const result = {
    line_items_next: line_items,
    quantity_discounted: 0,
    total_discount: 0
  }

  assert(
    qty_x>0 && qty_y>0,
    'buy_x_get_y: qty_x>0 && qty_y>0 fails'
  )

  do {
    const { 
      pass_mask: pass_mask_x, 
      pass_quantity: pass_quantity_x 
    } = compute_pass_mask(
      result.line_items_next, discount?.info?.filters
    )
  
    // we don't have enough X quantities
    if(qty_x > pass_quantity_x)
      break;

    // evolve: remove qty_x from line items
    const { line_items_next: line_items_x_next } = reduce_from_line_items(
      result.line_items_next, qty_x, pass_mask_x
    )

    // now let's see if we have Y items in what's left
    const { 
      pass_mask: pass_mask_y, 
      pass_quantity: pass_quantity_y 
    } = compute_pass_mask(
      line_items_x_next, discount_extra?.filters_y
    )
  
    // we don't have enough Y quantities
    if(qty_y > pass_quantity_y)
      break;

    // evolve: remove qty_y from line_items_x_next
    const { 
      line_items_next: line_items_y_next, 
      total: total_price_y
    } = reduce_from_line_items(
      line_items_x_next, qty_y, pass_mask_y
    );

    result.line_items_next = line_items_y_next
    result.total_discount += apply_discount(
      1, total_price_y, $percent, $fixed
    )
    result.quantity_discounted += qty_x + qty_y
  } while (recursive)

  return {
    ...result,
    quantity_undiscounted: lineitems_to_quantity(result.line_items_next)
  }
  
}

/**
 * 
 * @param {LineItem[]} line_items 
 * @param {PricingData} context 
 * @param {DiscountType} discount 
 * @returns {CalcDiscountResult}
 */
export const calculate_line_items_discount_with_bundle_discount = 
  (line_items, discount, context) => {
  
  assert(
    discount.info.details.meta.type === DiscountMetaEnum.bundle.type,
    'error:: tried to discount a non bundle discount'
  )

  const discount_details = discount?.info?.details
  /**@type {BundleDiscountExtra} */
  const discount_extra = discount_details?.extra

  const $percent = clamp(discount_extra?.percent, 0, 100) ?? 0
  const $fixed = discount_extra?.fixed ?? 0
  const recursive = discount_extra?.recursive ?? false

  /**@type {CalcDiscountResult} */
  const result = {
    line_items_next: line_items.map(li => ({ ...li })),
    quantity_discounted: 0,
    total_discount: 0
  }

  do {
    // Each filter is a product in the bundle
    const locations = discount?.info?.filters.reduce(
      /**
       * @param {number[]} p 
       * @param {Filter} f 
       */
      (p, f, ix) => {
        const loc = result.line_items_next.findIndex(
          l => test_product_filters_against_product(
            [f], l.data
          ) && (l.qty > 0)
        )

        p.push(loc)

        return p
      }, []
    )

    const valid = locations.every(loc => loc!=-1)

    if(!valid)
      break;

    // reduce quantities
    locations.forEach(
      loc => {
        result.line_items_next[loc].qty -= 1;
      }
    ) 

    const sum_price = locations.reduce(
      (p, loc) => p + result.line_items_next[loc].price, 0
    );


    result.quantity_discounted = locations.length;
    result.total_discount += apply_discount(
      1, sum_price, $percent, $fixed
    )

  } while (recursive)

  return {
    ...result,
    quantity_undiscounted: lineitems_to_quantity(result.line_items_next)
  }
  
}

/**
 * 
 * @param {LineItem[]} line_items 
 * @param {PricingData} context 
 * @param {DiscountType} discount 
 * @returns {CalcDiscountResult}
 */
export const calculate_line_items_discount_with_order_discount = 
  (line_items, discount, context) => {

  const discount_details = discount.info.details

  assert(
    discount_details.meta.type === DiscountMetaEnum.order.type,
    'error:: tried to discount a non bulk discount'
  )

  const pass = test_order_filters(
    discount.info.filters, context
  )
  let total_discount = 0

  if(pass) {
    /**@type {OrderDiscountExtra} */
    const extra = discount_details.extra
    const $p = extra.percent
    const $f = extra.fixed
    const free_shipping = extra.free_shipping

    total_discount = apply_discount(
      1, context.subtotal, $p, $f
    )
  }

  return {
    line_items_next: line_items,
    total_discount
  }
}

/**
 * route a discount to it's handler
 * given:
 * - a line of products
 * - a discount
 * 
 * Compute the: 
 * - total price
 * - explain how discounts contribute
 * 
 * @param {LineItem[]} line_items available line items
 * @param {PricingData} context context of discounts
 * @param {DiscountType} discount 
 */
export const calculate_line_items_for_discount = 
  (line_items, discount, context) => {
  
  const discount_type = discount.info.details.meta.type

  switch(discount_type) {
    case DiscountMetaEnum.regular.type:
      return calculate_line_items_discount_with_regular_discount(
        line_items, discount, context
      )
    case DiscountMetaEnum.bulk.type:
      return calculate_line_items_discount_with_bulk_discount(
        line_items, discount, context
      )
    case DiscountMetaEnum.order.type:
      return calculate_line_items_discount_with_order_discount(
        line_items, discount, context
      )
    case DiscountMetaEnum.buy_x_get_y.type:
      return calculate_line_items_discount_with_buy_x_get_y_discount(
        line_items, discount, context
      )
    case DiscountMetaEnum.bundle.type:
      return calculate_line_items_discount_with_bundle_discount(
        line_items, discount, context
      )
    default: 
        return {
          line_items_next: line_items,
          total_discount: 0
        }
  }
  
}


/**
 * given:
 * - a line of products
 * - a line of discounts
 * - a line of coupons
 * - shipping method
 * 
 * Compute the: 
 * - total price
 * - explain how discounts contribute
 * 
 * @param {LineItem[]} line_items 
 * @param {DiscountType[]} auto_discounts disabled discounted will be filtered out
 * @param {DiscountType[]} coupons disabled coupons will be filtered out
 * @param {ShippingMethodType} shipping_method 
 * @param {string} [uid] 
 * @returns {PricingData}
 */
export const calculate_pricing = 
  (line_items, auto_discounts=[], coupons=[], shipping_method, uid=undefined) => {

  auto_discounts = auto_discounts.filter(
    d => d.active && d.application.id==DiscountApplicationEnum.Auto.id
  )
  auto_discounts.sort(
    (a, b) => a.priority-b.priority
  )

  coupons = coupons.filter(
    d => d.active && d.application.id==DiscountApplicationEnum.Manual.id
  )
  coupons.sort(
    (a, b) => a.priority-b.priority
  )

  const discounts = [
    ...auto_discounts,
    ...coupons
  ]

  // protections against strings
  shipping_method.price = parseFloat(shipping_method.price)

  line_items = line_items.map(
    li => (
      {
        ...li,
        price: li.price,
        qty: parseInt(li.qty)
      }
    )
  ).sort(
    (a, b) => -a.price + b.price
  );
  
  const subtotal_undiscounted = line_items.reduce(
    (p, li) => p + li.qty * parseFloat(li.price ?? li.data?.price), 0
  )
  const quantity_total = line_items.reduce(
    (p, li) => p + li.qty , 0
  );

  /**@type {PricingData} */
  const context = {
    evo: [{
      quantity_discounted: 0,
      quantity_undiscounted: quantity_total,
      line_items,
      subtotal: subtotal_undiscounted,
      total: subtotal_undiscounted + shipping_method.price
    }],

    uid, 
    shipping_method,

    subtotal_discount: 0,
    subtotal_undiscounted,
    subtotal: subtotal_undiscounted - 0,

    total: subtotal_undiscounted + shipping_method.price,

    quantity_total,
    quantity_discounted: 0,

    errors: []
  }
  
  const report = discounts.reduce(
    (ctx, discount, ix) => {

      try {
        const { 
          line_items_next, total_discount, ...rest 
        } = calculate_line_items_for_discount(
          ctx.evo.at(-1).line_items, discount, ctx
        )
  
        // update global context
        ctx.subtotal_discount += total_discount
        ctx.subtotal -= total_discount
        ctx.total -= total_discount
        ctx.quantity_discounted = ctx.quantity_discounted + (rest?.quantity_discounted ?? 0)

        // push the iteration result for future review
        ctx.evo.push({
          ...rest,
          discount,
          discount_code: discount.handle,
          total_discount,
          subtotal: ctx.subtotal,
          total: ctx.total,
          line_items: line_items_next
        })

      } catch (e) {
        console.log(e)
        ctx.errors.push({
          discount_code: discount.handle,
          message: e?.message ?? e
        })
      } finally {
        ctx.total = parseFloat(ctx.total.toFixed(2))
        return ctx
      }

    }, context
  )
  
  return report
}