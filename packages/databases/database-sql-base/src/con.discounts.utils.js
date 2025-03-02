/**
 * @import { 
 *  DiscountType, FilterValue_p_in_price_range, FilterValue_p_not_in_collections, 
 *  FilterValue_p_in_collections, FilterValue_p_not_in_tags, FilterValue_p_in_tags, 
 *  FilterValue_p_in_products, FilterValue_p_not_in_products 
 * } from '@storecraft/core/api'
 * @import { Database } from '../types.sql.tables.js'
 * @import { ExpressionBuilder, BinaryOperator } from 'kysely'
 */
import { enums } from "@storecraft/core/api";

/** @param {DiscountType} d */
const is_order_discount = d => {
  return (d.info.details.meta.id===enums.DiscountMetaEnum.order.id);
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
 * @param {BinaryOperator} op 
 * @param {string[]} value 
 */
const eb_in = (eb, table, op, value) => {
  return eb.exists(
    eb => eb
      .selectFrom(table)
      .select('id')
      .where(
        eb => eb.and([
          eb.or(
            [
              eb(`${table}.entity_id`, '=', eb.ref('products.id')),
              eb(`${table}.entity_handle`, '=', eb.ref('products.handle')),
            ]
          ),
          eb(`${table}.value`, op, value)
        ])
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
    const op = filter.meta.op;

    switch (op) {
      case enums.FilterMetaEnum.p_all.op:
        // do nothing
        break;
      case enums.FilterMetaEnum.p_in_products.op:
        {
          
          const cast = /** @type {FilterValue_p_in_products} */ (
            Array.isArray(filter?.value) ? filter.value : []
          );

          conjunctions.push(
            eb(
              'products.handle', 'in', 
              cast.map(item => item.handle).filter(Boolean)
            )
          );
        }
        break;
      case enums.FilterMetaEnum.p_not_in_products.op:
        {
          
          const cast = /** @type {FilterValue_p_not_in_products} */ (
            Array.isArray(filter?.value) ? filter.value : []
          );

          conjunctions.push(
            eb(
              'products.handle', 'not in', 
              cast.map(item => item.handle).filter(Boolean)
            )
          );
        }
        break;
      case enums.FilterMetaEnum.p_in_tags.op:
        {
          
          const cast = /** @type {FilterValue_p_in_tags} */(
            Array.isArray(filter?.value) ? filter.value : []
          );
          
          conjunctions.push(
            eb_in(
              eb, 'entity_to_tags_projections', 'in', 
              cast
            )
          );
        }
        break;
      case enums.FilterMetaEnum.p_not_in_tags.op:
        {
          const cast = /** @type {FilterValue_p_not_in_tags} */ (
            Array.isArray(filter?.value) ? filter.value : []
          );

          conjunctions.push(
            eb.not(
              eb_in(
                eb, 'entity_to_tags_projections', 'in', 
                cast
              )
            )
          );
        }
        break;
      case enums.FilterMetaEnum.p_in_collections.op:
        {
          const cast = /** @type {FilterValue_p_in_collections} */ (
            Array.isArray(filter?.value) ? filter.value : []
          );

          // PROBLEM: we only have ids, but use handles in the filters
          conjunctions.push(
            eb_in(
              eb, 'products_to_collections', 'in', 
              cast.map(c => c.id)
            )
          );
        }
        break;
      case enums.FilterMetaEnum.p_not_in_collections.op:
        {
          const cast = /** @type {FilterValue_p_not_in_collections} */ (
            Array.isArray(filter?.value) ? filter.value : []
          );

          conjunctions.push(
            eb.not(
              eb_in(
                eb, 'products_to_collections', 'in', 
                cast.map(c => c.id)
              )
            )
          );
        }
        break;
      case enums.FilterMetaEnum.p_in_price_range.op:
        {
          const cast = /** @type {FilterValue_p_in_price_range} */ (
            {
              from: 0,
              to: Number.POSITIVE_INFINITY,
              ...(filter?.value ?? {}),
            }
          );

          const from = extract_abs_number(cast.from);
          const to = extract_abs_number(cast.to);

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

