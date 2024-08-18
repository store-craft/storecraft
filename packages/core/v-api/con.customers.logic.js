import { ID, apply_dates, assert, to_handle } from './utils.func.js'
import { customerTypeUpsertSchema } from './types.autogen.zod.api.js'
import { 
  regular_get, regular_list, 
  regular_remove } from './con.shared.js'
import { create_search_index, isDef } from './utils.index.js';
import { assert_zod } from './middle.zod-validate.js';

/**
 * @typedef {import('./types.api.d.ts').CustomerType} ItemType
 * @typedef {import('./types.api.d.ts').CustomerTypeUpsert} ItemTypeUpsert
 */

/**
 * @param {import("../types.public.d.ts").App} app
 */
export const db = app => app.db.resources.customers;

/**
 * 
 * @param {import("../types.public.d.ts").App} app
 */
export const upsert = (app) => 
  /**
   * 
   * @param {ItemTypeUpsert} item
   */
  async (item) => {
    const requires_event_processing = app.pubsub.has('customers/upsert');

    assert_zod(customerTypeUpsertSchema, item);

    // Check if exists
    const item_get = await db(app).getByEmail(item.email);
    if(item_get) {
      assert(item_get.id===item.id, `ids incompatible`, 401);
    }
    const id = !Boolean(item.id) ? ID('cus') : item.id;

    // search index
    let search = create_search_index({ ...item, id });
    isDef(item.auth_id) && search.push(`auth_id:${item.auth_id}`);
    isDef(item.firstname) && search.push(`${item.firstname}`);
    isDef(item.lastname) && search.push(`${item.lastname}`);
    isDef(item.email) && search.push(`${item.email}`);
    isDef(item.phone_number) && search.push(to_handle(item.phone_number, ''));
    
    // apply dates and index
    const final = apply_dates(
      { 
        ...item, id
      }
    );

    const succeed = await db(app).upsert(final, search);

    assert(succeed, 'failed', 401);

    if(requires_event_processing) {
      await app.pubsub.dispatch(
        'customers/upsert',
        {
          previous: item_get,
          current: final
        }
      )
    }

    return id;
  }


/**
 * 
 * @param {import("../types.public.d.ts").App} app
 */
export const getByEmail = (app) => 
/**
 * 
 * @param {string} email
 * @param {import('../v-database/types.public.d.ts').RegularGetOptions} [options]
 */
(email, options) => {
  return db(app).getByEmail(email);
};



/**
 * given a discount handle and query, return products of that discount
 * 
 * 
 * @param {import("../types.public.d.ts").App} app
 */
export const list_customer_orders = (app) => 
/**
 * 
 * @param {import('../v-database/types.public.d.ts').ID} customer_id 
 * @param {import('./types.api.query.d.ts').ApiQuery} q 
 */
(customer_id, q) => {
  return db(app).list_customer_orders(customer_id, q);
}

/**
 * 
 * @param {import("../types.public.d.ts").App} app
 */  
export const inter = app => {

  return {
    get: regular_get(app, db(app), 'customers/get'),
    getByEmail: getByEmail(app),
    upsert: upsert(app),
    remove: regular_remove(app, db(app), 'customers/remove'),
    list: regular_list(app, db(app), 'customers/list'),
    list_customer_orders: list_customer_orders(app)
  }
}


