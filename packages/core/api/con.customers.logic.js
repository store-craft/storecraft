/**
 * @import { CustomerType, CustomerTypeUpsert, OrderData } from './types.api.js'
 * @import { RegularGetOptions, ID as IDType } from '../database/types.public.js'
 * @import { ApiQuery } from './types.api.query.js'
 */
import { ID, apply_dates, assert, to_handle } from './utils.func.js'
import { customerTypeUpsertSchema } from './types.autogen.zod.api.js'
import { 
  regular_get, regular_list, 
} from './con.shared.js'
import { create_search_index, isDef } from './utils.index.js';
import { assert_zod } from './middle.zod-validate.js';
import { App } from '../index.js';


/**
 * @param {App} app
 */
export const db = app => app.db.resources.customers;

/**
 * @param {App} app
 */
export const upsert = (app) => 
  /**
   * @description `upsert` a `customer`
   * @param {CustomerTypeUpsert} item
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
        ...item, id,
        handle: item.email,
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
 * @param {App} app
 */
export const getByEmail = (app) => 
/**
 * @description get a customer by email
 * @param {string} email
 * @param {RegularGetOptions} [options]
 */
(email, options) => {
  return db(app).getByEmail(email);
};



/**
 * @param {App} app
 */
export const list_customer_orders = (app) => 
/**
 * @description given a customer id and query,
 * return orders of that customer
 * @param {IDType} customer_id 
 * @param {ApiQuery<OrderData>} [q={}] 
 */
(customer_id, q={}) => {
  return db(app).list_customer_orders(customer_id, q);
}

/**
 * @param {App} app
 */
export const count_customer_orders = (app) => 
  /**
   * @description count a customer orders query
   * @param {IDType} customer_id 
   * @param {ApiQuery<OrderData>} [q={}] 
   */
  (customer_id, q={}) => {
    return db(app).count_customer_orders(customer_id, q);
  }

  
/**
 * @param {App} app
 */
export const count = (app) => 
  /**
   * @description Count query results
   * @param {ApiQuery<CustomerType>} query 
   */
  (query) => {
    return db(app).count(query);
  }

/**
 * @param {App} app
 */
export const remove = (app) => 
  /**
   * @param {string} id_or_handle 
   */
  async (id_or_handle) => {
    // we will use the `auth` route for removal as it also
    // removes the customer from the auth system
    let au_id_or_handle = id_or_handle;

    if(au_id_or_handle.startsWith('cus_')) {
      au_id_or_handle = id_or_handle.replace('cus_', 'au_');
    }

    return app.api.auth.remove_auth_user(au_id_or_handle);
  }

/**
 * 
 * @param {App} app
 */  
export const inter = app => {

  return {
    get: regular_get(app, db(app), 'customers/get'),
    getByEmail: getByEmail(app),
    upsert: upsert(app),
    remove: remove(app),
    list: regular_list(app, db(app), 'customers/list'),
    list_customer_orders: list_customer_orders(app),
    count_customer_orders: count_customer_orders(app),
    count: count(app)
  }
}


