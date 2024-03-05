import { DiscountApplicationEnum, 
  DiscountMetaEnum, FilterMetaEnum } from "@storecraft/core";
import { to_objid } from "./utils.funcs.js";

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
 * @typedef {import("../index.js").Database} Database
 * @param {import("kysely").ExpressionBuilder<Database, 'products'>} eb 
 * @param {keyof Pick<Database,'entity_to_tags_projections' | 'products_to_collections'>} table 
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
 * @param {import("@storecraft/core").DiscountType} d 
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
      case FilterMetaEnum.p_all.op:
        // do nothing
        break;
      case FilterMetaEnum.p_in_handles.op:
        conjunctions.push(
          eb('products.handle', 'in', filter.value)
        );
        break;
      case FilterMetaEnum.p_not_in_handles.op:
        conjunctions.push(
          eb('products.handle', 'not in', filter.value)
        );
        break;
      case FilterMetaEnum.p_in_tags.op:
        Array.isArray(filter.value) && conjunctions.push(
          eb_in(eb, 'entity_to_tags_projections', 'in', filter.value)
        );
        break;
      case FilterMetaEnum.p_not_in_tags.op:
        Array.isArray(filter.value) && conjunctions.push(
          eb_in(eb, 'entity_to_tags_projections', 'not in', filter.value)
        );
        break;
      case FilterMetaEnum.p_in_collections.op:
        // PROBLEM: we only have ids, but use handles in the filters
        Array.isArray(filter.value) && conjunctions.push(
          eb_in(eb, 'products_to_collections', 'in', filter.value.map(c => c.id))
        );
        break;
      case FilterMetaEnum.p_not_in_collections.op:
        Array.isArray(filter.value) && conjunctions.push(
          eb_in(eb, 'products_to_collections', 'not in', filter.value.map(c => c.id))
        );
        break;
      case FilterMetaEnum.p_in_price_range.op:
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


// /**
//  * create a mongodb conjunctions clauses from discount, intended
//  * for filtering.
//  * @param {import("@storecraft/core").DiscountType} d 
//  */
// export const discount_to_conjunctions_old = d => {
//   // discount has to be product discount + automatic + active + has filters
//   const is_good = !is_order_discount(d) && is_automatic_discount(d) && 
//                   d.active && d?.info?.filters?.length;
//   if(!is_good) return;

//   const conjunctions = [];
//   const filters = d.info.filters;

//   for(const filter of filters) {
//     const op = filter.meta.op;

//     switch (op) {
//       case FilterMetaEnum.p_all.op:
//         // do nothing
//         break;
//       case FilterMetaEnum.p_in_handles.op:
//         conjunctions.push(
//           { handle: { $in: filter.value } }
//         );
//         break;
//       case FilterMetaEnum.p_not_in_handles.op:
//         conjunctions.push(
//           { handle: { $nin: filter.value } }
//         );
//         break;
//       case FilterMetaEnum.p_in_tags.op:
//         conjunctions.push(
//           { tags: { $in: filter.value } }
//         );
//         break;
//       case FilterMetaEnum.p_not_in_tags.op:
//         conjunctions.push(
//           { tags: { $nin: filter.value } }
//         );
//         break;
//       case FilterMetaEnum.p_in_collections.op:
//         // PROBLEM: we only have ids, but use handles in the filters
//         conjunctions.push(
//           { '_relations.collections.ids': { $in: filter.value?.map(c => to_objid(c.id)) } }
//         );
//         break;
//       case FilterMetaEnum.p_not_in_collections.op:
//         conjunctions.push(
//           { '_relations.collections.ids': { $nin: filter.value?.map(c => to_objid(c.id)) } }
//         );
//         break;
//       case FilterMetaEnum.p_in_price_range.op:
//         const from = extract_abs_number(filter?.value?.from);
//         const to = extract_abs_number(filter?.value?.to);
//         const conj = { price: { $and: [] } };
//         if(from) conj.price.$and.push({ $gte: from });
//         if(to) conj.price.$and.push({ $lt: to });
//         (to || from) && conjunctions.push(conj);
//         break;
    
//       default:
//         break;
//     }
//   }

//   return conjunctions;
// }
