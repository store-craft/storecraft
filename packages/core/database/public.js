/**
 * @import { DiscountType } from '../api/types.public.js';
 */

import { union } from '../api/utils.func.js'

/**
 * @description When a `discount` is upserted, it has side-effects on
 * `products` and `variants`. This function computes extra search keywords
 * for affected products.
 * @param {{handle: string, id: string}} discount
 */
export const helper_compute_product_extra_search_keywords_because_of_discount_side_effect_for_db = (discount) => {
  return union(
    discount?.id && `discount:${discount.id}`,
    discount?.handle && `discount:${discount.handle}`,
    discount?.handle && `tag:discount_${discount.handle}`,
  )
}

/**
 * @description When a `discount` is upserted, it has side-effects on
 * `products` and `variants`. This function computes extra tags
 * for affected products.
 * @param {{handle: string, id: string}} discount
 */
export const helper_compute_product_extra_tags_because_of_discount_side_effect_for_db = (discount) => {
  return union(
    discount?.handle && `discount_${discount.handle}`,
  )
}