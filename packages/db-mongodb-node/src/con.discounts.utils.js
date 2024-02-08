import { DiscountApplicationEnum, DiscountMetaEnum, FilterMetaEnum } from "@storecraft/core";
import { Database } from "../driver.js";

/** @param {import("@storecraft/core").DiscountType} d */
const is_order_discount = d => {
  return (d.info.details.meta.id===DiscountMetaEnum.order.id);
}

/** @param {import("@storecraft/core").DiscountType} d */
const is_automatic_discount = d => {
  return (d.application.id===DiscountApplicationEnum.Auto.id);
}

const extract_abs_number = v => {
  return v && !isNaN(v) && v!==Infinity && Math.abs(v);
}

/**
 * create a mongodb conjunctions clauses from discount, intended
 * for filtering.
 * @param {import("@storecraft/core").DiscountType} d 
 */
export const discount_to_mongo_conjunctions = d => {
  // discount has to be product discount + automatic + active + has filters
  const is_good = !is_order_discount(d) && is_automatic_discount(d) && 
                  d.active && d?.info?.filters?.length;
  if(!is_good) return;

  const conjunctions = [];
  const filters = d.info.filters;

  for(const filter of filters) {
    const op = filter.meta.op;

    switch (op) {
      case FilterMetaEnum.p_all.op:
        // do nothing
        break;
      case FilterMetaEnum.p_in_handles.op:
        conjunctions.push(
          { handle: { $in: filter.value } }
        );
        break;
      case FilterMetaEnum.p_not_in_handles.op:
        conjunctions.push(
          { handle: { $nin: filter.value } }
        );
        break;
      case FilterMetaEnum.p_in_tags.op:
        conjunctions.push(
          { tags: { $in: filter.value } }
        );
        break;
      case FilterMetaEnum.p_not_in_tags.op:
        conjunctions.push(
          { tags: { $nin: filter.value } }
        );
        break;
      case FilterMetaEnum.p_in_collections.op:
        // PROBLEM: we only have ids, but use handles in the filters
        conjunctions.push(
          { '_relations.collection.ids': { $in: filter.value } }
        );
        break;
      case FilterMetaEnum.p_not_in_collections.op:
        conjunctions.push(
          { '_relations.collection.ids': { $nin: filter.value } }
        );
        break;
      case FilterMetaEnum.p_in_price_range.op:
        const from = extract_abs_number(filter?.value?.from);
        const to = extract_abs_number(filter?.value?.to);
        const conj = { price: { $and: [] } };
        if(from) conj.price.$and.push({ $gte: from });
        if(to) conj.price.$and.push({ $lt: to });
        (to || from) && conjunctions.push(conj);
        break;
    
      default:
        break;
    }
  }

  return conjunctions;
}
