/**
 * @import { ApiQuery, Tuple } from '@storecraft/core/api'
 * @import { VQL, VQL_OPS, legal_value_types } from '@storecraft/core/vql'
 * @import { Filter, FilterOperators, FindOptions } from 'mongodb'
 */
import { 
  legacy_query_with_cursors_to_vql_string 
} from "@storecraft/core/api/query.legacy.js";
import { to_objid } from "./utils.funcs.js";
import { parse, utils } from "@storecraft/core/vql";

/**
 * @description Convert a **VQL** to a mongo filter
 * @param {VQL} vql 
 */
export const query_vql_to_mongo_filter = (vql) => {

  if(!vql)
    return undefined;

  /** @template T @param {T} fn @returns {T} */
  const identity = (fn) => {
    return fn;
  }

  /**
   * @param {VQL_OPS<legal_value_types>} ops 
   * `ops` object about this property
   * @param {string} name 
   * property name in the table
   */
  const leaf_ops = (ops, name) => {
    
    const ops_keys = /** @type {(keyof VQL_OPS)[]} */(
      Object.keys(ops)
    );

    const values = ops_keys.map(
      (k) => {
        /** `arg` is basically the value of `op.$eq` `op.$gte` etc.. */
        const arg = (ops[k]);

        switch (k) {
          case '$eq':
            return /** @type {FilterOperators<legal_value_types>} */({
              $eq: arg
            });
          case '$ne':
            return /** @type {FilterOperators<legal_value_types>} */({
              $ne: arg
            });
          case '$gt':
            return /** @type {FilterOperators<legal_value_types>} */({
              $gt: arg
            });
          case '$gte':
            return /** @type {FilterOperators<legal_value_types>} */({
              $gte: arg
            });
          case '$lt':
            return /** @type {FilterOperators<legal_value_types>} */({
              $lt: arg
            });
          case '$lte':
            return /** @type {FilterOperators<legal_value_types>} */({
              $lte: arg
            });
          case '$like':
            return /** @type {FilterOperators<legal_value_types>} */({
              $regex: String(arg)
            });
          case '$in': {
            return /** @type {FilterOperators<legal_value_types>} */({
              $in: arg
            });
          }
          case '$nin': {
            return /** @type {FilterOperators<legal_value_types>} */({
              $nin: arg
            });
          }
          default:
            throw new Error(
              `VQL-ops-failed: Unrecognized operator ${k}`
            );
        }
      }
    );
    
    if(values.length===0)
      return undefined;

    return /** @type {Filter<any>} */ ({
      [name]: values.reduce(
        (p, c) => {
          return { ...p, ...c }
        }, 
        {}
      )
    }) 
  }

  const reduced = utils.reduce_vql(
    {
      vql,

      map_leaf: (node) => {
        return leaf_ops(
          node.op, 
          node.name
        );
      },

      reduce_AND: identity(
        (nodes) => {
          return /** @type {Filter<any>} */({
            $and: nodes
          });
        }
      ),

      reduce_OR: (nodes) => {
        return /** @type {Filter<any>} */({
          $or: nodes
        });
      },

      reduce_NOT: (node) => {
        return /** @type {Filter<any>} */({
          $nor: [node]
        });
      },

      reduce_SEARCH: (value) => {
        return /** @type {Filter<{_relations : { search: string[]}}>} */({
          '_relations.search': { $regex: value }
        });
      },

    }

  );

  return reduced;
}

/**
 * @description Let's transform ids into mongo ids
 * @param {Tuple} c a cursor record
 * @returns {[k: string, v: any]}
 */
const transform = c => {
  if(c[0]!=='id') 
    return c;
  return [ '_id', to_objid(String(c[1])) ];
}

/**
 * @description Convert an API Query into mongo dialect, 
 * also sanitize.
 * @param {ApiQuery<any>} q 
 */
export const query_to_mongo = (q) => {
  
  try { // compute VQL clauses 
    q.vql = /** @type {VQL} */({
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

  /** @type {Filter<any>} */
  const filter = query_vql_to_mongo_filter(
    /** @type {VQL} */(q.vql)
  );

  // `reverse_sign=-1` means we need to reverse because of `limitToLast`
  const reverse_sign = q.limitToLast ? -1 : 1;
  const asc = q.order === 'asc';
  const sort_sign = (asc ? 1 : -1) * reverse_sign;

  // compute sort fields and order
  /** @type {FindOptions["sort"]} */
  const sort = (
    q.sortBy?.length ? 
    q.sortBy : 
    ['updated_at', 'id']
  )
  .reduce(
    (p, c) => (
      p[c]=sort_sign
    ) && p, 
    {}
  );

  return {
    filter,
    sort,
    reverse_sign
  }

}
