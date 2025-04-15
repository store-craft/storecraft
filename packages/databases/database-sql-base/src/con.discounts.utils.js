/**
 * @import { 
 *  DiscountType, Filter_p_in_price_range, Filter_p_not_in_collections, 
 *  Filter_p_in_collections, Filter_p_not_in_tags, Filter_p_in_tags, 
 *  Filter_p_in_products, Filter_p_not_in_products 
 * } from '@storecraft/core/api'
 * @import { Database } from '../types.sql.tables.js'
 * @import { ExpressionBuilder, BinaryOperator } from 'kysely'
 */
import { enums } from "@storecraft/core/api";

/** @param {DiscountType} d */
const is_order_discount = d => {
  return (
    (d.info.details.type===enums.DiscountMetaEnum.order.type) ||
    // @ts-ignore
    (d.info.details.meta?.type===enums.DiscountMetaEnum.order.type)
  );
}

/** @param {DiscountType} d */
const is_automatic_discount = d => {
  return (d.application.id===enums.DiscountApplicationEnum.Auto.id);
}

const extract_abs_number = v => {
  return v && !isNaN(v) && v!==Infinity && Math.abs(v);
}
/**
 * @param {ExpressionBuilder<Database, 'products'>} eb 
 * @param {keyof Pick<Database, 'entity_to_tags_projections' | 'products_to_collections'>} table 
 * @param {string[]} value 
 */
const eb_in = (eb, table, value) => {
  return eb.exists(
    eb => eb
    .selectFrom(table)
    .select('id')
    .where(
      eb => eb.and(
        [
          eb.or(
            [
              eb(`${table}.entity_id`, '=', eb.ref('products.id')),
              eb(`${table}.entity_handle`, '=', eb.ref('products.handle')),
            ]
          ),
          eb(`${table}.value`, 'in', value)
        ]
      )
    )
  )
}

/**
 * create a mongodb conjunctions clauses from discount, intended
 * for filtering.
 * @param {ExpressionBuilder<Database, 'products'>} eb 
 * @param {DiscountType} d 
 */
export const discount_to_conjunctions = (eb, d) => {
  // discount has to be product discount + automatic + active + has filters
  const is_good = (
    !is_order_discount(d) && is_automatic_discount(d) && 
    d.active && d?.info?.filters?.length
  );

  if(!is_good) return [];

  const conjunctions = [];
  const filters = d.info.filters;

  for(const filter of filters) {
    const op = filter.op ?? filter.meta.op;

    switch (op) {
      case enums.FilterMetaEnum.p_all.op:
        // do nothing
        break;
      case enums.FilterMetaEnum.p_in_products.op:
        {
          const cast_filter = /** @type {Filter_p_in_products} */ (
            filter
          );
          const value = cast_filter?.value ?? [];
          conjunctions.push(
            eb(
              'products.handle', 'in', 
              value.map(item => item.handle).filter(Boolean)
            )
          );
        }
        break;
      case enums.FilterMetaEnum.p_not_in_products.op:
        {
          const cast_filter = /** @type {Filter_p_not_in_products} */ (
            filter
          );
          const value = cast_filter?.value ?? [];

          conjunctions.push(
            eb(
              'products.handle', 'not in', 
              value.map(item => item.handle).filter(Boolean)
            )
          );
        }
        break;
      case enums.FilterMetaEnum.p_in_tags.op:
        {
          const cast_filter = /** @type {Filter_p_in_tags} */ (
            filter
          );
          const value = cast_filter?.value ?? [];

          conjunctions.push(
            eb_in(
              eb, 'entity_to_tags_projections',
              value
            )
          );
        }
        break;
      case enums.FilterMetaEnum.p_not_in_tags.op:
        {
          const cast_filter = /** @type {Filter_p_not_in_tags} */ (
            filter
          );
          const value = cast_filter?.value ?? [];

          conjunctions.push(
            eb.not(
              eb_in(
                eb, 'entity_to_tags_projections',
                value
              )
            )
          );
        }
        break;
      case enums.FilterMetaEnum.p_in_collections.op:
        {
          const cast_filter = /** @type {Filter_p_in_collections} */ (
            filter
          );
          const value = cast_filter?.value ?? [];

          // PROBLEM: we only have ids, but use handles in the filters
          conjunctions.push(
            eb_in(
              eb, 'products_to_collections',
              value.map(c => c.id)
            )
          );
        }
        break;
      case enums.FilterMetaEnum.p_not_in_collections.op:
        {
          const cast_filter = /** @type {Filter_p_not_in_collections} */ (
            filter
          );
          const value = cast_filter?.value ?? [];

          conjunctions.push(
            eb.not(
              eb_in(
                eb, 'products_to_collections',
                value.map(c => c.id)
              )
            )
          );
        }
        break;
      case enums.FilterMetaEnum.p_in_price_range.op:
        {
          const cast_filter = /** @type {Filter_p_in_price_range} */ (
            filter
          );
          const value = /** @type {Filter_p_in_price_range["value"]} */({
            from: 0,
            to: Number.POSITIVE_INFINITY,
            ...(cast_filter?.value ?? {}),
          });

          const from = extract_abs_number(value.from);
          const to = extract_abs_number(value.to);

          const conj = { price: { $and: [] } };

          if(from) 
            conjunctions.push(eb('price', '>=', from));

          if(to) 
            conjunctions.push(eb('price', '<', to));

        }
        break;
    
      default:
        break;
    }
  }

  return conjunctions;
}

