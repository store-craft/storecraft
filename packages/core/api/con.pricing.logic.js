
/**
 * @import { 
 *  AddressType, OrderData, ProductType, ProductTypeUpsert,
 *  VariantType, VariantTypeUpsert, ShippingMethodType,
 *  DiscountType, LineItem, PricingData
 * } from './types.api.js';
 * @import { 
 *  Filter, Filter_o_date_in_range, Filter_o_has_customers, 
 *  Filter_o_items_count_in_range, Filter_o_subtotal_in_range,
 *  Filter_p_all, Filter_p_in_collections, 
 *  Filter_p_in_price_range, Filter_p_in_products, Filter_p_in_tags, 
 *  Filter_p_not_in_collections, Filter_p_not_in_products, 
 *  Filter_p_not_in_tags
 * } from './types.api.js';
 * @import { tax_provider } from '../tax/types.public.js';
 * @import { 
 *  BulkDiscountExtra, OrderDiscountExtra, RegularDiscountExtra, 
 *  BuyXGetYDiscountExtra, BundleDiscountExtra 
 * } from './types.api.js';
 * 
 * @typedef { ProductType | ProductTypeUpsert | VariantType | VariantTypeUpsert } ProductLike
 * @typedef {import('./types.api.js').FilterMetaEnum} FilterMeta
 * @typedef {import('./types.api.js').DiscountMetaEnum} DiscountMeta
 */


import { 
  DiscountApplicationEnum, DiscountMetaEnum, FilterMetaEnum, 
  is_order_filter, 
  is_product_filter
} from './types.api.enums.js';


/**
 * @description test a product filter against a product
 * @param {Filter} filter 
 * @param {ProductLike} product 
 * @returns {boolean}
 */
export const test_product_filter_against_product = 
  (filter, product) => {

  // confirm `product` filter
  if(
    !filter && 
    !is_product_filter(filter)
  ) {
    return false;
  }

  try {
    switch (filter.op ?? filter?.meta?.op) {
      case FilterMetaEnum.p_all.op:
        return true;

      case FilterMetaEnum.p_in_price_range.op:
        {
          const filter_cast = /** @type {Filter_p_in_price_range} */(
            filter
          );

          /** @type {Filter_p_in_price_range["value"]} */
          const value = { 
            from: 0, 
            to: Number.POSITIVE_INFINITY,
            ...(filter_cast?.value) ?? {}
          };

          return Boolean(
            (product.price >= value.from) && 
            (product.price <= value.to)
          )
        }

      case FilterMetaEnum.p_in_collections.op:
        {
          const filter_cast = /** @type {Filter_p_in_collections} */(
            filter
          );

          const value = filter_cast?.value ?? [];
          
          return product?.collections?.some(
            c => value.map(v => v.id).includes(c.id)
          ) ?? false;
        }

      case FilterMetaEnum.p_not_in_collections.op:
        {
          const filter_cast = /** @type {Filter_p_not_in_collections} */(
            filter
          );

          const value = filter_cast?.value ?? [];

          return product?.collections?.every(
              c => !value.map(v => v.id).includes(c.id)
          ) ?? true;
        }

      case FilterMetaEnum.p_in_products.op:
        {
          const filter_cast = /** @type {Filter_p_in_products} */(
            filter
          );
          const value = filter_cast?.value ?? [];

          return value.map(it => it.handle).includes(product.handle);
        }

      case FilterMetaEnum.p_not_in_products.op:
        {
          const filter_cast = /** @type {Filter_p_not_in_products} */(
            filter
          );
          const value = filter_cast?.value ?? [];

          return !value.map(it => it.handle).includes(product.handle);
        }

      case FilterMetaEnum.p_in_tags.op:
        {
          const filter_cast = /** @type {Filter_p_in_tags} */(
            filter
          );
          const value = filter_cast?.value ?? [];

          return product?.tags?.some(
            c => value.includes(c)
          ) ?? false;
        }
      case FilterMetaEnum.p_not_in_tags.op:
        {
          const filter_cast = /** @type {Filter_p_not_in_tags} */(
            filter
          );
          const value = filter_cast?.value ?? [];

          return product?.tags?.every(
            c => !value.includes(c)
          ) ?? true;
        }
    }
  
  } catch (e) {
    return false
  }

}


/**
 * @description test a list of product filters against a product
 * @param {Filter[]} filters 
 * @param {ProductLike} product 
 * @return {boolean}
 */
export const test_product_filters_against_product = 
  (filters=[], product) => {

  filters = filters?.filter(
    is_product_filter
  );

  return filters.length>0 && 
    filters?.every(
      (filter) => test_product_filter_against_product(
        filter, product
      )
    )
}

/**
 * @description test an order filter against an order
 * @param {Filter} filter 
 * @param {PricingData} context 
 * @returns {boolean}
 */
const test_order_filter = 
  (filter, { uid, total, subtotal, quantity_total }) => {

  // console.log('filter', filter)

  if(
    !filter && 
    !is_order_filter(filter)
  ) {
    return false;
  }

  try {
    switch (filter.op ?? filter.meta.op) {
      case FilterMetaEnum.o_date_in_range.op:
        {
          const now = (new Date()).toISOString();

          const filter_cast = /** @type {Filter_o_date_in_range} */(
            filter
          );

          /** @type {Filter_o_date_in_range["value"]} */
          const value = {
            from: (new Date(0)).toISOString(),
            to: now,
            ...(
              filter_cast.value ?? {}
            )
          };

          // console.log('cast', cast)
          return Boolean(
            (now >= value.from) && 
            (now <= value.to)
          );
        }

      case FilterMetaEnum.o_has_customer.op: 
        {
          const filter_cast = /** @type {Filter_o_has_customers} */(
            filter
          );
          const value = filter_cast?.value ?? [];
          
          return Boolean(
            value.find(cus => cus.id===uid)
          );
        }

      case FilterMetaEnum.o_items_count_in_range.op:
        {
          const filter_cast = /** @type {Filter_o_items_count_in_range} */(
            filter
          );

          /** @type {Filter_o_items_count_in_range["value"]} */
          const value = { 
            from: 0,
            ...(filter_cast?.value ?? {})
          };

          return Boolean(quantity_total >= value.from);
        }

      case FilterMetaEnum.o_subtotal_in_range.op:
        {
          const filter_cast = /** @type {Filter_o_subtotal_in_range} */(
            filter
          );

          /** @type {Filter_o_subtotal_in_range["value"]} */
          const value = { 
            from: 0,
            ...(filter_cast?.value ?? {})
          };

          return Boolean(subtotal >= value.from)
        }
        
      default:
        return false
    }
  
  } catch (e) {
    console.log('e', e)
    return false
  }

}

/**
 * @description test a list of order filters against an order
 * @param {Filter[]} filters 
 * @param {PricingData} context 
 * @return {boolean}
 */
const test_order_filters = 
  (filters, context) => {

  filters = filters?.filter(
    is_order_filter
  );

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
        a;
}

/**
 * @description apply discount to a quantity of items
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
export const calculate_line_items_discount_with_regular_discount = (
  line_items, discount, context
) => {
  
  const discount_type = discount.info.details.type ?? 
    discount.info.details.meta.type;

  assert(
    discount_type===DiscountMetaEnum.regular.type,
    'error:: tried to discount a non regular discount'
  )

  // mask
  const pass_mask = line_items.map(
    li => {
      return test_product_filters_against_product(
        discount?.info?.filters, /** @type {ProductType} */(li.data)
      )
    }
  );

  // perform discount and compute new generation of line items
  const line_items_next = line_items.filter(
    (li, ix) => !pass_mask[ix]
  );

  const line_items_discounted = line_items.filter(
    (li, ix) => pass_mask[ix]
  );

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
    line_items_discounted,
    ...report
  }
  
}


/**
 * 
 * @param {LineItem[]} line_items 
 * @param {DiscountType} discount 
 * @param {PricingData} context 
 * 
 * @returns {CalcDiscountResult}
 */
export const calculate_line_items_discount_with_bulk_discount = (
  line_items, discount, context
) => {
  
  const discount_type = discount.info.details.type ?? 
    discount.info.details.meta.type;

  assert(
    discount_type===DiscountMetaEnum.bulk.type,
    'error:: tried to discount a non bulk discount'
  )

  const discount_details = discount?.info?.details;
  
  const discount_extra = /** @type {BulkDiscountExtra} */ (
    discount_details?.extra
  );
  
  const $percent = clamp(discount_extra?.percent, 0, 100) ?? 0;
  const $fixed = discount_extra?.fixed ?? 0;
  const qty = discount_extra?.qty ?? 0;
  const recursive = discount_extra?.recursive ?? false;

  assert(
    qty > 0, 'bulk discount qty <= 0'
  );

  const { pass_mask, pass_quantity } = compute_pass_mask(
    line_items, discount?.info?.filters
  );

  // compute all the total quantity that is legable for the
  // discount
  const total_legal_qty = pass_quantity;

  // how many legable groups/bulks do we have
  const max_bulks_can_fit =  Math.floor(total_legal_qty / qty);

  const how_many_bulks_to_fit = recursive ? 
      max_bulks_can_fit :
      Math.min(max_bulks_can_fit, 1);

  const how_many_to_reduce = how_many_bulks_to_fit * qty;

  // remove how_many_fit and compute their total
  const { 
    line_items_next, total, line_items_removed: line_items_discounted,
  } = reduce_from_line_items(
    line_items, how_many_to_reduce, pass_mask
  );

  const total_discount = apply_discount(
    1, total, $percent, $fixed * how_many_bulks_to_fit
  );

  return {
    line_items_next,
    line_items_discounted,
    total_discount,
    quantity_discounted: how_many_to_reduce,
    quantity_undiscounted: lineitems_to_quantity(line_items_next)
  }
  
}

/**
 * @typedef {object} ReduceResult
 * @property {number} how_many_left_to_reduce
 * @property {number} total total price of reduced items
 * @property {LineItem[]} line_items_next line items after reduction
 * @property {LineItem[]} line_items_removed reduced line items
 * 
 * @description create new line items with reduced quantities
 * @param {LineItem[]} line_items 
 * @param {number} how_many_to_reduce 
 * @param {boolean[]} pass_mask 
 * 
 * @returns {ReduceResult}
 */
const reduce_from_line_items = (
  line_items, how_many_to_reduce, pass_mask
) => {

  const line_items_next = line_items.map(
    li => ({ ...li })
  );

  return line_items_next.reduce(
    (p, c, ix) => {
      if(!pass_mask[ix])
        return p;
      
      const reduce_count = Math.min(
        p.how_many_left_to_reduce,
        c.qty
      );

      if(reduce_count==0)
          return p;

      const reduced_total = reduce_count * (c.price ?? c?.data?.price ?? 0);

      p.how_many_left_to_reduce -= reduce_count;
      p.total += reduced_total;

      // reduce
      c.qty -= reduce_count;
      p.line_items_removed.push(
        {
          ...c,
          qty: reduce_count,
          price: c.price ?? c?.data?.price ?? undefined
        }
      )

      return p;
    }
    ,/** @type {ReduceResult} */ ({ 
      how_many_left_to_reduce: how_many_to_reduce,
      total: 0,
      line_items_next,
      line_items_removed: []
    })
  )
}

/**
 * @typedef {object} PassResult
 * @property {boolean[]} pass_mask
 * @property {number} pass_quantity how many quantities pass the filters
 * @property {number} pass_total_quantity total quantities of line items
 * 
 * 
 * @param {LineItem[]} line_items line items to inspect
 * @param {Filter[]} filters filters
 * 
 * 
 * @return {PassResult}
 */
const compute_pass_mask = (line_items=[], filters=[]) => {
  return line_items.reduce(
    (p, c, ix) => {
      const pass = test_product_filters_against_product(
        filters, /** @type {ProductType} */(c.data)
      );

      p.pass_mask.push(pass);
      p.pass_quantity += (pass ? c.qty : 0);
      p.pass_total_quantity += c.qty;

      return p;
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
 * @property {LineItem[]} line_items_discounted
 * @property {number} total_discount 
 * total discount given at this stage
 * @property {number} [quantity_discounted] 
 * quantity of items that were part of discount and may not be used again
 * @property {number} [quantity_undiscounted] 
 * quantity of remaining items
 */

/**
 * 
 * @param {LineItem[]} line_items 
 * @param {DiscountType} discount 
 * @param {PricingData} context 
 * 
 * @returns {CalcDiscountResult}
 */
export const calculate_line_items_discount_with_buy_x_get_y_discount = 
  (line_items, discount, context) => {
  
  const discount_type = discount.info.details.type ?? 
    discount.info.details.meta.type;

  assert(
    discount_type===DiscountMetaEnum.buy_x_get_y.type,
    'error:: tried to discount a non buy_x_get_y discount'
  );

  const discount_details = discount?.info?.details
  
  const discount_extra = /**@type {BuyXGetYDiscountExtra} */ (
    discount_details?.extra
  );

  const $percent = clamp(discount_extra?.percent, 0, 100) ?? 0;
  const $fixed = discount_extra?.fixed ?? 0;
  const qty_x = discount_extra?.qty_x ?? 0;
  const qty_y = discount_extra?.qty_y ?? 0;
  const recursive = discount_extra?.recursive ?? false;

  /**@type {CalcDiscountResult} */
  const result = {
    line_items_next: line_items,
    line_items_discounted: [],
    quantity_discounted: 0,
    total_discount: 0
  }

  assert(
    qty_x>0 && qty_y>0,
    'buy_x_get_y: qty_x>0 && qty_y>0 fails'
  );

  do {
    const { 
      pass_mask: pass_mask_x, 
      pass_quantity: pass_quantity_x 
    } = compute_pass_mask(
      result.line_items_next, discount?.info?.filters
    );
  
    // we don't have enough X quantities
    if(qty_x > pass_quantity_x)
      break;

    // evolve: remove qty_x from line items
    const { 
      line_items_next: line_items_x_next, 
      line_items_removed: line_items_removed_x
    } = reduce_from_line_items(
      result.line_items_next, qty_x, pass_mask_x
    );

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
      total: total_price_y,
      line_items_removed: line_items_removed_y
    } = reduce_from_line_items(
      line_items_x_next, qty_y, pass_mask_y
    );

    result.line_items_discounted.push(
      ...line_items_removed_x,
      ...line_items_removed_y
    );

    result.line_items_next = line_items_y_next
    result.total_discount += apply_discount(
      1, total_price_y, $percent, $fixed
    )
    result.quantity_discounted += qty_x + qty_y
  } while (recursive);

  return {
    ...result,
    quantity_undiscounted: lineitems_to_quantity(result.line_items_next)
  }
  
}

/**
 * 
 * @param {LineItem[]} line_items 
 * @param {DiscountType} discount 
 * @param {PricingData} context 
 * 
 * 
 * @returns {CalcDiscountResult}
 */
export const calculate_line_items_discount_with_bundle_discount = (
  line_items, discount, context
) => {
  
  const discount_type = discount.info.details.type ?? 
    discount.info.details.meta.type;

  assert(
    discount_type===DiscountMetaEnum.bundle.type,
    'error:: tried to discount a non bundle discount'
  );

  const discount_details = discount?.info?.details;
  /**@type {BundleDiscountExtra} */
  const discount_extra = discount_details?.extra;

  const $percent = clamp(discount_extra?.percent, 0, 100) ?? 0;
  const $fixed = discount_extra?.fixed ?? 0;
  const recursive = discount_extra?.recursive ?? false;

  /**@type {CalcDiscountResult} */
  const result = {
    line_items_next: line_items.map(li => ({ ...li })),
    line_items_discounted: [],
    quantity_discounted: 0,
    total_discount: 0
  }

  do {
    // Each filter is a product in the bundle

    /** @type {LineItem[]} */
    const temp_line_items_discounted = [];
    const locations = discount?.info?.filters.reduce(
      /**
       * @param {number[]} p 
       * @param {Filter} f 
       */
      (p, f, ix) => {
        const loc = result.line_items_next.findIndex(
          l => test_product_filters_against_product(
            [f], /** @type {ProductType} */(l.data)
          ) && (l.qty > 0)
        );

        // remember the location
        p.push(loc);

        // mark it
        if(loc!=-1) {
          result.line_items_next[loc].qty -= 1;
          temp_line_items_discounted.push(
            {
              ...result.line_items_next[loc],
              qty: 1,
              data: null,
            }
          )
        }

        return p;
      }, []
    );

    const valid = locations.every(loc => loc!=-1);

    // rollback if invalid
    if(!valid) {
      locations.filter(loc => loc!=-1).forEach(
        loc => {
          result.line_items_next[loc].qty += 1;
        }
      );

      break;
    }
    
    const sum_price = locations.reduce(
      (p, loc) => p + (
        result.line_items_next[loc].price ?? 
        result.line_items_next[loc].data?.price
      ), 0
    );

    result.line_items_discounted.push(...temp_line_items_discounted);
    result.quantity_discounted += locations.length;
    result.total_discount += apply_discount(
      1, sum_price, $percent, $fixed
    );

  } while (recursive);

  return {
    ...result,
    quantity_undiscounted: lineitems_to_quantity(result.line_items_next)
  }
  
}

/**
 * 
 * @param {LineItem[]} line_items 
 * @param {DiscountType} discount 
 * @param {PricingData} context 
 * 
 * 
 * @returns {CalcDiscountResult}
 */
export const calculate_line_items_discount_with_order_discount = 
  (line_items, discount, context) => {

  const discount_details = discount.info.details;
  const discount_type = discount.info.details.type ?? 
    discount.info.details.meta.type;

  assert(
    discount_type===DiscountMetaEnum.order.type,
    'error:: tried to discount a non order discount'
  );

  const pass = test_order_filters(
    discount.info.filters, context
  );

  let total_discount = 0;

  if(pass) {
    /**@type {OrderDiscountExtra} */
    const extra = discount_details.extra;
    const $p = extra.percent;
    const $f = extra.fixed;
    const free_shipping = extra.free_shipping;

    total_discount = apply_discount(
      1, context.subtotal, $p, $f
    );
  }

  return {
    line_items_next: line_items,
    line_items_discounted: [],
    total_discount
  }
}

/**
 * @description route a discount to it's handler
 * given:
 * - a line of products
 * - a discount
 * 
 * Compute the: 
 * - total price
 * - explain how discounts contribute
 * 
 * @param {LineItem[]} line_items available line items
 * @param {DiscountType} discount 
 * @param {PricingData} context context of discounts
 * @return {CalcDiscountResult}
 */
export const calculate_line_items_for_discount = 
  (line_items, discount, context) => {
  
  const discount_type = discount.info.details.type ?? 
    discount.info.details.meta.type;

  switch(discount_type) {
    case DiscountMetaEnum.regular.type:
      return calculate_line_items_discount_with_regular_discount(
        line_items, discount, context
      );
    case DiscountMetaEnum.bulk.type:
      return calculate_line_items_discount_with_bulk_discount(
        line_items, discount, context
      );
    case DiscountMetaEnum.order.type:
      return calculate_line_items_discount_with_order_discount(
        line_items, discount, context
      );
    case DiscountMetaEnum.buy_x_get_y.type:
      return calculate_line_items_discount_with_buy_x_get_y_discount(
        line_items, discount, context
      );
    case DiscountMetaEnum.bundle.type:
      return calculate_line_items_discount_with_bundle_discount(
        line_items, discount, context
      );
    default: 
      return {
        line_items_next: line_items,
        line_items_discounted: [],
        total_discount: 0
      }
  }
  
}


/**
 * @description given:
 * - a line of products
 * - a line of discounts
 * - a line of coupons
 * - shipping method
 * 
 * Compute the: 
 * - total price
 * - explain how discounts contribute
 * 
 * 
 * @param {LineItem[]} line_items 
 * @param {DiscountType[]} auto_discounts disabled discounted will be filtered out
 * @param {DiscountType[]} coupons disabled coupons will be filtered out
 * @param {ShippingMethodType} [shipping_method] 
 * @param {Partial<AddressType>} [shipping_address] used for taxes
 * @param {string} [uid=undefined] 
 * @param {tax_provider} [tax_provider=undefined] 
 * @param {OrderData} [tax_provider=undefined] 
 * 
 * @returns {Promise<PricingData>}
 */
export const calculate_pricing = async (
  line_items, auto_discounts=[], coupons=[], 
  shipping_method, shipping_address, uid=undefined,
  tax_provider=undefined
) => {

  auto_discounts = auto_discounts.filter(
    d => d.active && d.application.id==DiscountApplicationEnum.Auto.id
  );

  auto_discounts.sort(
    (a, b) => a.priority-b.priority
  );

  coupons = coupons.filter(
    d => d.active && d.application.id==DiscountApplicationEnum.Manual.id
  );

  coupons.sort(
    (a, b) => a.priority-b.priority
  );

  const discounts = [
    ...auto_discounts,
    ...coupons
  ];

  // protections against strings
  if(shipping_method) {
    shipping_method.price = parseFloat(
      String(shipping_method?.price ?? 0)
    );
  }

  line_items = line_items.map(
    li => (
      {
        ...li,
        price: li.price,
        qty: li.qty
      }
    )
  ).sort(
    (a, b) => -a.price + b.price
  );
  
  const subtotal_undiscounted = line_items.reduce(
    (p, li) => p + li.qty * (li.price ?? li.data?.price), 0
  );

  const quantity_total = line_items.reduce(
    (p, li) => p + li.qty , 0
  );

  const initial_total = subtotal_undiscounted + (
    shipping_method?.price ?? 0
  );

  /**@type {PricingData} */
  const context = {
    evo: [
      {
        quantity_discounted: 0,
        quantity_undiscounted: quantity_total,
        line_items_next: line_items,
        line_items_discounted: [],
        subtotal: subtotal_undiscounted,
        total: initial_total
      }
    ],

    uid, 
    shipping_method,

    subtotal_discount: 0,
    subtotal_undiscounted,
    subtotal: subtotal_undiscounted - 0,

    total: initial_total,
    total_without_taxes: initial_total,

    quantity_total,
    quantity_discounted: 0,

    errors: []
  }
  
  const report = discounts.reduce(
    (ctx, discount, ix) => {

      try {
        const evo_entry = calculate_line_items_for_discount(
          ctx.evo.at(-1).line_items_next, discount, ctx
        );
  
        // update global context
        ctx.subtotal_discount += evo_entry.total_discount;
        ctx.subtotal -= evo_entry.total_discount;
        ctx.total -= evo_entry.total_discount;
        ctx.total_without_taxes = ctx.total;
        ctx.quantity_discounted = ctx.quantity_discounted + (
          evo_entry?.quantity_discounted ?? 0
        );

        // push the iteration result for future review
        ctx.evo.push(
          {
            ...evo_entry,
            discount_code: discount.handle,
            discount,
            subtotal: parseFloat(ctx.subtotal.toFixed(2)),
            total: parseFloat(ctx.total.toFixed(2)),
          }
        );

      } catch (e) {

        console.log(e);

        ctx.errors.push(
          {
            discount_code: discount.handle,
            message: e?.message ?? e
          }
        );
      } finally {
        return ctx
      }

    }, context
  );

  // taxes

  {
    if(tax_provider) {
      report.taxes = await tax_provider.compute(
        shipping_address, {...report}
      );
      report.total += report.taxes.reduce(
        (p, c) => p + (c.value ?? 0), 0
      );
    }
  }

  report.total = parseFloat(report.total.toFixed(2));
  report.total_without_taxes = parseFloat(
    report.total_without_taxes.toFixed(2)
  );
  report.subtotal = parseFloat(report.subtotal.toFixed(2));
  report.subtotal_undiscounted = parseFloat(
    report.subtotal_undiscounted.toFixed(2)
  );
  report.subtotal_discount = parseFloat(
    report.subtotal_discount.toFixed(2)
  );

  // now, let's clean all of the line items data field 
  // as it's not needed and redundant
  report.evo?.forEach(
    evo => {
      evo.line_items_next.forEach(
        li => {
          li.price = li.price ?? li.data?.price;
          delete li.data;
        }
      );

      evo.line_items_discounted.forEach(
        li => {
          li.price = li.price ?? li.data?.price;
          delete li.data;
        }
      );
    }
  );

  // console.log(JSON.stringify(report, null, 2))

  return report;
}