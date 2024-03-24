import { enums } from "@storecraft/core/v-api";

/** @param {import("@storecraft/core/v-api").DiscountType} d */
const is_order_discount = d => {
  return (d.info.details.meta.id===enums.DiscountMetaEnum.order.id);
}

/** @param {import("@storecraft/core/v-api").DiscountType} d */
const is_automatic_discount = d => {
  return (d.application.id===enums.DiscountApplicationEnum.Auto.id);
}

const extract_abs_number = v => {
  return v && !isNaN(v) && v!==Infinity && Math.abs(v);
}
/**
 * @typedef {import("../index.js").Database} Database
 * @param {import("kysely").ExpressionBuilder<Database, 'products'>} eb 
 * @param {keyof Pick<Database, 'entity_to_tags_projections' | 'products_to_collections'>} table 
 * @param {import("kysely").BinaryOperator} op 
 * @param {string[]} value 
 */
const eb_in = (eb, table, op, value) => {
  return eb.exists(
    eb => eb
      .selectFrom(table)
      .select('id')
      .where(
        eb => eb.and([
          eb.or([
            eb(`${table}.entity_id`, '=', eb.ref('products.id')),
            eb(`${table}.entity_handle`, '=', eb.ref('products.handle')),
          ]),
          eb(`${table}.value`, op, value)
        ])
      )
  )
}

/**
 * create a mongodb conjunctions clauses from discount, intended
 * for filtering.
 * @param {import("kysely").ExpressionBuilder<Database, 'products'>} eb 
 * @param {import("@storecraft/core/v-api").DiscountType} d 
 */
export const discount_to_conjunctions = (eb, d) => {
  // discount has to be product discount + automatic + active + has filters
  const is_good = !is_order_discount(d) && is_automatic_discount(d) && 
                  d.active && d?.info?.filters?.length;
  if(!is_good) return [];

  const conjunctions = [];
  const filters = d.info.filters;

  for(const filter of filters) {
    const op = filter.meta.op;

    switch (op) {
      case enums.FilterMetaEnum.p_all.op:
        // do nothing
        break;
      case enums.FilterMetaEnum.p_in_handles.op:
        conjunctions.push(
          eb('products.handle', 'in', filter.value)
        );
        break;
      case enums.FilterMetaEnum.p_not_in_handles.op:
        conjunctions.push(
          eb('products.handle', 'not in', filter.value)
        );
        break;
      case enums.FilterMetaEnum.p_in_tags.op:
        Array.isArray(filter.value) && conjunctions.push(
          eb_in(eb, 'entity_to_tags_projections', 'in', filter.value)
        );
        break;
      case enums.FilterMetaEnum.p_not_in_tags.op:
        Array.isArray(filter.value) && conjunctions.push(
          eb_in(eb, 'entity_to_tags_projections', 'not in', filter.value)
        );
        break;
      case enums.FilterMetaEnum.p_in_collections.op:
        // PROBLEM: we only have ids, but use handles in the filters
        Array.isArray(filter.value) && conjunctions.push(
          eb_in(eb, 'products_to_collections', 'in', filter.value.map(c => c.id))
        );
        break;
      case enums.FilterMetaEnum.p_not_in_collections.op:
        Array.isArray(filter.value) && conjunctions.push(
          eb_in(eb, 'products_to_collections', 'not in', filter.value.map(c => c.id))
        );
        break;
      case enums.FilterMetaEnum.p_in_price_range.op:
        const from = extract_abs_number(filter?.value?.from);
        const to = extract_abs_number(filter?.value?.to);
        const conj = { price: { $and: [] } };
        if(from) 
          conjunctions.push(eb('price', '>=', from))
        if(to) 
          conjunctions.push(eb('price', '<', to))
        break;
    
      default:
        break;
    }
  }

  return conjunctions;
}

