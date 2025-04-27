/**
 * @import { ApiQuery } from '@storecraft/core/api'
 * @import { VQL, VQL_OPS } from '@storecraft/core/vql'
 * @import { Database } from '../types.sql.tables.js'
 * @import { ExpressionBuilder, SelectQueryBuilder } from 'kysely'
 * @import { legal_value_types } from "@storecraft/core/vql";
 */
import { legacy_query_with_cursors_to_vql_string } from "@storecraft/core/api/query.legacy.js";
import { parse, utils } from "@storecraft/core/vql";

/**
 * @template {keyof Database} [Table=(keyof Database)]
 * @param {ExpressionBuilder<Database, Table>} eb 
 * @param {VQL} vql 
 * @param {Table} table_name 
 */
export const query_vql_root_to_eb = (eb, vql, table_name) => {

  /** @template T @param {T} fn @returns {T} */
  const identity = (fn) => {
    return fn;
  }

  /**
   * @param {VQL_OPS<legal_value_types>} ops `ops` object about this property
   * @param {(keyof (Database[keyof Database]))} name 
   * property name in the table
   */
  const leaf_ops = (ops, name) => {
    
    const ops_keys = /** @type {(keyof VQL_OPS)[]} */(
      Object.keys(ops)
    );
    const values = ops_keys.map(
      (k) => {
        /** `arg` is basically `op.$eq` `op.$gte` etc.. */
        const arg = boolean_to_0_or_1(ops[k]);
        const arg_any = /** @type {any} */(arg);
        let result;

        const prop_ref = eb.ref(`${table_name}.${name}`)
        switch (k) {
          case '$eq':
            result = eb(prop_ref, '=', arg_any);
            break;
          case '$ne':
            result = eb(prop_ref, '!=', arg_any);
            break;
          case '$gt':
            result = eb(prop_ref, '>', arg_any);
            break;
          case '$gte':
            result = eb(prop_ref, '>=', arg_any);
            // console.log('$gte ', {value, arg, result, name})
            break;
          case '$lt':
            result = eb(prop_ref, '<', arg_any);
            break;
          case '$lte':
            result = eb(prop_ref, '<=', arg_any);
            break;
          case '$like':
            // @ts-ignore
            result = eb(prop_ref, 'like', String(arg_any))
            break;
          case '$in': {
            result = eb(prop_ref, 'in', arg_any)
            break;
          }
          case '$nin': {
            result = eb(prop_ref, 'not in', arg_any)
            break;
          }
          default:
            if(result===undefined)
              throw new Error('VQL-ops-failed');
        }

        // debug
        // console.log(
        //   'test_ops',
        //   {k, arg, result}
        // );

        return result;
      }
    );
    
    return eb.and(values);
  }

  const reduced = utils.reduce_vql(
    {
      vql,

      map_leaf: (node) => {
        return leaf_ops(
          node.op, 
          /** @type {any} */(node.name)
        );
      },

      reduce_AND: identity(
        (nodes) => {
          return eb.and(nodes);
        }
      ),

      reduce_OR: (nodes) => {
        return eb.or(nodes);
      },

      reduce_NOT: (node) => {
        return eb.not(node);
      },

      reduce_SEARCH: (value) => {
        return eb
        .exists(
          eb => eb
          .selectFrom('entity_to_search_terms')
          .select('id')
          .where(
            eb => eb.and(
              [
                eb.or(
                  [
                    eb(
                      'entity_to_search_terms.entity_id', '=', 
                      eb.ref(`${table_name}.id`)
                    ),
                    eb(
                      `entity_to_search_terms.entity_handle`, '=', 
                      eb.ref(`${table_name}.handle`)
                    ),
                  ]
                ),
                eb(
                  `entity_to_search_terms.value`, 'like', 
                  value.toLowerCase()
                )
              ]
            )
          )
        )
      },

    }
  );

  return reduced;
}

/**
 * @description Transform booleans to 0 or 1. We write `boolean`
 * types as `0` or `1` in SQL to be uniform with **SQLite**.
 * @param {legal_value_types | legal_value_types[]} value 
 * @returns {legal_value_types | legal_value_types[]}  
 */
const boolean_to_0_or_1 = (value) => {
  return (typeof value==='boolean') ? 
    (value ? 1 : 0) : 
    value;
}

/**
 * @description Convert an {@link ApiQuery} into **SQL** Clause.
 * @template {keyof Database} [Table=(keyof Database)]
 * @template {{a:number}} [G={a:number}]
 * @param {ExpressionBuilder<Database, Table>} eb 
 * @param {ApiQuery<G>} q 
 * @param {Table} table_name 
 */
export const query_to_eb = (eb, q={}, table_name) => {
  const clauses = [];

  try { // compute VQL clauses 
    q.vql = /** @type {VQL<G>} */({
      $and: [
        parse(q.vql),
        // supports legacy queries with cursors, will be deprecated
        // in future versions.
        parse(
          legacy_query_with_cursors_to_vql_string(q)
        )
      ].filter(Boolean)
    });
  } catch(e) {
    console.error('VQL parse error:\n', e, '\nfor query:\n', q);
  }

  if(q.vql) {
    const vql_clause = query_vql_root_to_eb(
      eb, /** @type {VQL} */(q.vql), table_name
    );
    vql_clause && 
      clauses.push(vql_clause);
  }

  return eb.and(clauses);
}

const SIGN = /** @type {const} */({
  '1': 'asc',
  '-1': 'desc'
});


/**
 * @description Convert an API Query into sort clause.
 * @template O
 * @template {keyof Database} [Table=(keyof Database)]
 * @param {SelectQueryBuilder<Database, Table, O>} qb 
 * @param {ApiQuery<any>} q 
 * @param {Table} table 
 * @returns {SelectQueryBuilder<Database, Table, O>}
 */
export const withSort = (qb, q={}, table) => {
  // `reverse_sign=-1` means we need to reverse because of `limitToLast`
  const reverse_sign = q.limitToLast ? -1 : 1;
  const asc = q.order === 'asc';
  const sort_sign = (asc ? 1 : -1) * reverse_sign;

  // compute sort fields and order
  const props = /** @type {(keyof (Database[Table]))[]} */(
    q.sortBy?.length ? 
    q.sortBy : 
    ['updated_at', 'id']
  );

  let next = qb;
  
  // we do it iteratively because `kysely` deprecated 
  // array of `orderBy` in favor of chaining
  for(const prop of props) {
    // console.log('add_sort_to_eb', {s, table});
    next = next.orderBy(
      `${table}.${prop}`,
      SIGN[sort_sign]
    );
  }

  return next;
}


/**
 * @description Apply a {@link ApiQuery} into {@link SelectQueryBuilder},
 * with `sorting`, `filtering` and `limit`.
 * @template O
 * @template {keyof Database} [Table=(keyof Database)]
 * @param {SelectQueryBuilder<Database, Table, O>} qb 
 * @param {ApiQuery<any>} query 
 * @param {Table} table 
 * @returns {SelectQueryBuilder<Database, Table, O>}
 */
export const withQuery = (qb, query={}, table) => {
  return withSort(
    qb.where(
      (eb) => {
        return query_to_eb(
          eb, query, table
        );
      }
    )
    .limit(query.limitToLast ?? query.limit ?? 10),
    query, table
  );
}
