import { enums } from "@storecraft/core/api";
import { to_objid_safe } from "./utils.funcs.js";

/** @param {import("@storecraft/core/api").DiscountType} d */
const is_order_discount = d => {
  return (d.info.details.meta.id===enums.DiscountMetaEnum.order.id);
}

/** @param {import("@storecraft/core/api").DiscountType} d */
const is_automatic_discount = d => {
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
 * @param {import("@storecraft/core/api").DiscountType} d 
 */
export const discount_to_mongo_conjunctions = d => {
  // discount has to be product discount + automatic + active + has filters
  const conjunctions = [];
  const is_good = !is_order_discount(d) && is_automatic_discount(d) && 
                  d.active && d?.info?.filters?.length;
  if(!is_good) conjunctions;

  const filters = d.info.filters;

  for(const filter of filters) {
    const op = filter.meta.op;

    switch (op) {
      case enums.FilterMetaEnum.p_all.op:
        // do nothing
        break;
      case enums.FilterMetaEnum.p_in_products.op:
        {
          const cast = /** @type {import("@storecraft/core/api").FilterValue_p_in_products} */ (
            filter.value ?? []
          );
          
          conjunctions.push(
            { handle: { $in: cast.map(it => it.handle) } }
          );
        }
        break;
      case enums.FilterMetaEnum.p_not_in_products.op:
        {
          const cast = /** @type {import("@storecraft/core/api").FilterValue_p_not_in_products} */(
            filter.value ?? []
          );
          
          conjunctions.push(
            { handle: { $nin: cast.map(it => it.handle) } }
          );
        }
        break;
      case enums.FilterMetaEnum.p_in_tags.op:
        {
          const cast = /** @type {import("@storecraft/core/api").FilterValue_p_in_tags} */ (
            filter.value ?? []
          );
          
          conjunctions.push(
            { tags: { $in: cast } }
          );
        }
        break;
      case enums.FilterMetaEnum.p_not_in_tags.op:
        {
          const cast = /** @type {import("@storecraft/core/api").FilterValue_p_not_in_tags} */(
            filter.value ?? []
          );

          conjunctions.push(
            { tags: { $nin: cast } }
          );
        }
        break;
      case enums.FilterMetaEnum.p_in_collections.op:
        {
          const cast = /** @type {import("@storecraft/core/api").FilterValue_p_in_collections} */ (
            filter.value ?? []
          );

          conjunctions.push(
            { 
              '_relations.collections.ids': { 
                $in: cast.map(c => to_objid_safe(c.id)).filter(Boolean) 
              } 
            }
          );
        }
        break;
      case enums.FilterMetaEnum.p_not_in_collections.op:
        {
          const cast = /** @type {import("@storecraft/core/api").FilterValue_p_not_in_collections} */ (
            filter.value ?? []
          );

          conjunctions.push(
            { 
              '_relations.collections.ids': { 
                $nin: cast.map(c => to_objid_safe(c.id)).filter(Boolean) 
              } 
            }
          );
        }
        break;
      case enums.FilterMetaEnum.p_in_price_range.op:
        {
          const cast = /** @type {import("@storecraft/core/api").FilterValue_p_in_price_range} */ (
            {
              from: 0,
              to: Number.POSITIVE_INFINITY,
              ...(filter?.value ?? {})
            }
          );

          const from = extract_abs_number(cast.from);
          const to = extract_abs_number(cast.to);

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
