import { DiscountApplicationEnum, 
  DiscountMetaEnum, FilterMetaEnum } from '../types.api.enums.js';

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
 * @param {any} v 
 * @param {any[]} arr 
 */
const test_in = (v, arr) => {
  return Array.isArray(arr) && arr.length && arr.includes(v)
}

/**
 * @template T
 * @param {T[]} arr 
 * @param {T[]} from 
 */
const arr_contains_any_from = (arr, from) => {
  return Array.isArray(from) && from.some(f => Boolean(arr?.includes(f)));
}

/**
 * Test a single product against a single discount locally
 * by filters.
 * @param {import('../types.api.js').ProductType} p 
 * @param {import('../types.api.js').DiscountType} d 
 */
export const test_product_with_discount = (p, d) => {
  const is_good = !is_order_discount(d) && 
                  d.active && d?.info?.filters?.length;
  if(!is_good) return false;

  const filters = d.info.filters;
  let pass = true;

  for(const filter of filters) {
    const op = filter.meta.op;

    switch (op) {
      case FilterMetaEnum.p_all.op:
        break;
      case FilterMetaEnum.p_in_handles.op:
        pass &&= test_in(p.handle, filter.value);
        break;
      case FilterMetaEnum.p_not_in_handles.op:
        pass &&= !test_in(p.handle, filter.value);
        break;
      case FilterMetaEnum.p_in_tags.op:
        pass &&= arr_contains_any_from(p.tags, filter.value);
        break;
      case FilterMetaEnum.p_not_in_tags.op:
        pass &&= !arr_contains_any_from(p.tags, filter.value);
        break;
      case FilterMetaEnum.p_in_collections.op:
        pass &&= arr_contains_any_from(
          p.collections.map(c => c?.handle), 
          filter?.value?.map(v => v?.handle)
        );
        break;
      case FilterMetaEnum.p_not_in_collections.op:
        pass &&= !arr_contains_any_from(
          p.collections.map(c => c?.handle), 
          filter?.value?.map(v => v?.handle)
        );
        break;
      case FilterMetaEnum.p_in_price_range.op:
        const from = extract_abs_number(filter?.value?.from) ?? 0;
        const to = extract_abs_number(filter?.value?.to) ?? Infinity;
        pass &&= (p.price>=from && p.price<to);
        break;
    
      default:
        break;
    }

    // short circuit early
    if(!pass) return false;
  }

  return pass;
}
