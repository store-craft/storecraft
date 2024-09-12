import { App } from '../index.js';
import { 
  CheckoutStatusEnum, FulfillOptionsEnum, PaymentOptionsEnum 
} from './types.api.enums.js';
import { assert } from './utils.func.js';

/**
 * Get the start of a day
 * 
 * @param  {ConstructorParameters<typeof Date>["0"]} date 
 */
const startOfDay = (date=Date.now()) => {
  var d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/**
 * Get the end of a day
 * 
 * @param  {ConstructorParameters<typeof Date>["0"]} date 
 */
const endOfDay = (date=Date.now()) => {
  var d = new Date(date);
  d.setUTCHours(23, 59, 59, 999);
  return d;
}

/**
 * 
 * @param {string | number | Date} from 
 * @param {string | number | Date} to 
 */
const how_many_days = (from, to) => {
  const delta = (new Date(to).getTime()) - (new Date(from).getTime());
  const days = Math.floor(delta / DAY);
  return days;
}

const MINUTE = 60000
const HOUR = 3600000
const DAY = 86400000

/**
 * 
 * 
 * @param {App} app
 */
export const compute_statistics = app => 
/**
 * Compute the `statistics` of `sales` / `orders` a period of time per day.
 * 
 * @param {string} [from_day] `ISO` / `UTC` / `timestamp` date
 * @param {string} [to_day] `ISO` / `UTC` / `timestamp` date
 * 
 * @returns {Promise<import('./types.api.d.ts').OrdersStatisticsType>}
 */
async (from_day, to_day) => {

  const date_to_day = endOfDay(
    to_day ? new Date(to_day) : new Date()
  );
  const date_from_day = startOfDay(
    from_day ? new Date(from_day) : 
      new Date(new Date(to_day).getTime() - 90 * DAY)
  );

  const orders = await app.db.resources.orders.list(
    {
      sortBy: ['created_at'],
      order: 'asc',
      startAt:  [
        ['created_at', date_from_day.toISOString()]
      ],
      endAt:  [
        ['created_at', date_to_day.toISOString()]
      ],
      limit: 1000000
    }
  );

  // process days stats

  /** @type {import('./types.api.d.ts').OrdersStatisticsType} */
  const stat = {
    from_day: date_from_day.toISOString(),
    to_day: date_to_day.toISOString(),
    count_days: how_many_days(date_from_day, date_to_day) + 1,
    days: {
    }
  };

  return orders.reduce(
    (p, order) => {

      const {
        pricing: { 
          total: total_order_price,
          evo
        }, 
        line_items, created_at 
      } = order;
      
      const day = startOfDay(created_at).toISOString();

      const day_d = p.days[day] = p.days[day] ?? {
        day,
        metrics: {
        },
        products: {},
        collections: {},
        tags: {},
        discounts: {}
      }

      /**
       * 
       * @param {keyof import('./types.api.d.ts').OrdersStatisticsDay["metrics"]} key 
       */
      const metric_adjust = key => {
        day_d.metrics[key] = day_d.metrics[key] ?? {
          count: 0, total_income: 0
        };
        day_d.metrics[key].count += 1;
        day_d.metrics[key].total_income += total_order_price;
      }

      // update total and number of orders
      // checkouts
      if(order.status.checkout.id === CheckoutStatusEnum.complete.id) {
        metric_adjust('checkouts_completed');
      } else if(order.status.checkout.id === CheckoutStatusEnum.created.id) {
        metric_adjust('checkouts_created');
      }

      // payments
      if(order.status.payment.id === PaymentOptionsEnum.captured.id) {
        metric_adjust('payments_captured')
      } else if(order.status.payment.id === PaymentOptionsEnum.failed.id) {
        metric_adjust('payments_failed')
      } else if(order.status.payment.id === PaymentOptionsEnum.unpaid.id) {
        metric_adjust('payments_unpaid')
      }

      // fulfillment
      if(order.status.payment.id === FulfillOptionsEnum.draft.id) {
        metric_adjust('fulfillment_draft')
      } else if(order.status.payment.id === FulfillOptionsEnum.processing.id) {
        metric_adjust('fulfillment_processing')
      } else if(order.status.payment.id === FulfillOptionsEnum.shipped.id) {
        metric_adjust('fulfillment_shipped')
      } else if(order.status.payment.id === FulfillOptionsEnum.cancelled.id) {
        metric_adjust('fulfillment_cancelled')
      }

      // iterate `line items` to collect used 
      // `products` / `discounts` / `collections` / `tags`
      // embedded in the `line items`
      line_items?.forEach(
        li => {

          const { id: id_pr, qty, data } = li;
          const { handle, collections, tags, title } = data ?? {};
          
          // we prefer `handles`
          const id = handle ?? id_pr;

          // `products`
          day_d.products[id] = day_d.products[id] ?? {
            handle: id, id: id_pr, title, count: 0, 
          }

          day_d.products[id].count += qty;

          // `collections`
          collections?.forEach(
            (k) => {
              day_d.collections[k.handle] = day_d.collections[k.handle] ?? {
                handle: k.handle,
                id: k.id,
                title: k.title,
                count: 0
              }
              day_d.collections[k.handle].count += 1;
            }
          );

          // `tags`
          tags?.forEach(
            (k) => {
              day_d.tags[k] = day_d.tags[k] ?? {
                count: 0,
                handle: k.split('_').at(-1),
                id: undefined, 
                title: k
              }
              day_d.tags[k].count += 1;
            }
          );

        }
      );

      // `discounts`
      evo?.filter(
        e => Boolean(e?.total_discount > 0) && e.discount?.active
      )
      .forEach(
        (e) => {
          const code = e?.discount_code
          day_d.discounts[code] = day_d.discounts[code] ?? {
            count: 0,
            handle: code, 
            id: e.discount?.id,
            title: e.discount?.title
          }
          day_d.discounts[code].count += 1;
        }
      );

      return p
    }, stat
  );

}

/** @type {(keyof App["db"]["resources"])[]} */
const tables = [
  'auth_users',
  'tags',
  'collections',
  'customers',
  'products',
  'storefronts',
  'images',
  'posts',
  'shipping_methods',
  'notifications',
  'discounts',
  'orders',
  'templates',
]

/**
 * 
 * @description Compute the count `statistics` of a table with `query`
 *  
 * @param {import("../types.public.d.ts").App} app
 */
export const compute_count_of_query = app => 
/**
 * 
 * @param {Exclude<keyof App["db"]["resources"], 'search'>} [table] which `table` to get count of query
 * @param {import('./types.api.query.d.ts').ApiQuery} [query] The `query` used for counting
 * 
 * @returns {Promise<number>}
 */
(table, query) => {
  assert(
    tables.includes(table),
    `Table ${String(table)} is not allowed for counting !`
  );

  /** @type {import('../v-database/types.public.d.ts').db_crud} */
  const db = app.db?.resources?.[table];

  return db.count(query);
}


/**
 * 
 * @param {App} app 
 */
export const inter = app => {

  return {
    compute_count_of_query: compute_count_of_query(app),
    compute_statistics: compute_statistics(app),
  }
}