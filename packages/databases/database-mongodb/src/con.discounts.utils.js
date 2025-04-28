/**
 * @import { 
 *  DiscountType, Filter_p_in_price_range, Filter_p_not_in_collections, 
 *  Filter_p_in_collections, Filter_p_not_in_tags, Filter_p_in_tags, 
 *  Filter_p_in_products, Filter_p_not_in_products 
 * } from '@storecraft/core/api'
 */
import { enums } from "@storecraft/core/api";
import { to_objid_safe } from "./utils.funcs.js";

/** @param {DiscountType} d */
export const is_order_discount = d => {
  return (
    (d.info.details.type===enums.DiscountMetaEnum.order.type) ||
    // @ts-ignore
    (d.info.details.meta?.type===enums.DiscountMetaEnum.order.type)
  );
}

/** @param {DiscountType} d */
export const is_automatic_discount = d => {
  return (d.application.id===enums.DiscountApplicationEnum.Auto.id);
}

const extract_abs_number = v => {
  return v && !isNaN(v) && v!==Infinity && Math.abs(v);
}

/**
 * create a mongodb conjunctions clauses from discount, intended
 * for filtering.
 * 
 * 
 * @param {DiscountType} d 
 */
export const discount_to_mongo_conjunctions = d => {
  // discount has to be product discount + automatic + active + has filters
  const conjunctions = [];
  const is_good = !is_order_discount(d) && is_automatic_discount(d) && 
                  d.active && d?.info?.filters?.length;
  if(!is_good) conjunctions;

  const filters = d.info.filters;

  for(const filter of filters) {
    const op = filter.op ?? filter.meta.op;

    switch (op) {
      case enums.FilterMetaEnum.p_all.op:
        // do nothing
        break;
      case enums.FilterMetaEnum.p_in_products.op:
        {
          const filter_cast = /** @type {Filter_p_in_products} */ (
            filter
          );
          const value = filter_cast?.value ?? [];
          
          conjunctions.push(
            { handle: { $in: value.map(it => it.handle) } }
          );
        }
        break;
      case enums.FilterMetaEnum.p_not_in_products.op:
        {
          const filter_cast = /** @type {Filter_p_not_in_products} */ (
            filter
          );

          const value = filter_cast?.value ?? [];
          
          conjunctions.push(
            { handle: { $nin: value.map(it => it.handle) } }
          );
        }
        break;
      case enums.FilterMetaEnum.p_in_tags.op:
        {
          const filter_cast = /** @type {Filter_p_in_tags} */ (
            filter
          );
          const value = filter_cast?.value ?? [];
          
          conjunctions.push(
            { tags: { $in: value } }
          );
        }
        break;
      case enums.FilterMetaEnum.p_not_in_tags.op:
        {
          const filter_cast = /** @type {Filter_p_not_in_tags} */ (
            filter
          );
          const value = filter_cast?.value ?? [];

          conjunctions.push(
            { tags: { $nin: value } }
          );
        }
        break;
      case enums.FilterMetaEnum.p_in_collections.op:
        {
          const filter_cast = /** @type {Filter_p_in_collections} */ (
            filter
          );
          const value = filter_cast?.value ?? [];
          
          conjunctions.push(
            { 
              '_relations.collections.ids': { 
                $in: value.map(c => to_objid_safe(c.id)).filter(Boolean) 
              } 
            }
          );
        }
        break;
      case enums.FilterMetaEnum.p_not_in_collections.op:
        {
          const filter_cast = /** @type {Filter_p_not_in_collections} */ (
            filter
          );
          const value = filter_cast?.value ?? [];

          conjunctions.push(
            { 
              '_relations.collections.ids': { 
                $nin: value.map(c => to_objid_safe(c.id)).filter(Boolean) 
              } 
            }
          );
        }
        break;
      case enums.FilterMetaEnum.p_in_price_range.op:
        {
          const filter_cast = /** @type {Filter_p_in_price_range} */ (
            filter
          );
          const value = /** @type {Filter_p_in_price_range["value"]} */ (
            {
              from: 0,
              to: Number.POSITIVE_INFINITY,
              ...(filter_cast?.value ?? {})
            }
          );

          const from = extract_abs_number(value.from);
          const to = extract_abs_number(value.to);

          const conj = { price: { $and: [] } };

          if(from) conj.price.$and.push({ $gte: from });
          if(to) conj.price.$and.push({ $lt: to });

          (to || from) && conjunctions.push(conj);
  
        }
        break;
    
      default:
        break;
    }
  }

  return conjunctions;
}
