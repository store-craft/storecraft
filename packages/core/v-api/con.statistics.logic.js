import { CheckoutStatusEnum, PaymentOptionsEnum } from './types.api.enums.js';

/**
 * Get the start of a day
 * 
 * @param  {ConstructorParameters<typeof Date>["0"]} date 
 */
const startOfDay = (date=Date.now()) => {
  var d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/**
 * Get the end of a day
 * 
 * @param  {ConstructorParameters<typeof Date>["0"]} date 
 */
const endOfDay = (date=Date.now()) => {
  var d = new Date(date);
  d.setUTCHours(23, 59, 59, 999);
  return d;
}

const MINUTE = 60000
const HOUR = 3600000
const DAY = 86400000

/**
 * 
 * Compute the `statistics` of `sales` / `orders` a period of time
 * 
 * @param {import("../types.public.js").App} app
 * @param {string} [from_day] `ISO` / `UTC` / `timestamp` date
 * @param {string} [to_day] `ISO` / `UTC` / `timestamp` date
 * 
 * @returns {Promise<import('./types.api.js').StatisticsType>}
 * 
 */
export const compute_statistics = async (app, from_day, to_day) => {

  const date_to_day = endOfDay(
    to_day ? new Date(to_day) : new Date()
  );
  const date_from_day = startOfDay(
    from_day ? new Date(from_day) : 
      new Date(new Date(to_day).getTime() - 90 * DAY)
  );

  const orders = await app.db.orders.list(
    {
      sortBy: ['created_at'],
      order: 'asc',
      startAt:  [
        ['created_at', date_from_day.toISOString()]
      ],
      endAt:  [
        ['created_at', date_to_day.toISOString()]
      ],
    }
  );

  // process days stats

  /** @type {import('./types.api.js').StatisticsType} */
  const stat = {
    from_day: date_from_day.toISOString(),
    to_day: date_to_day.toISOString(),
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
      
      const day = startOfDay(created_at).getTime();

      const day_d = p.days[day] = p.days[day] ?? {
        day,
        total_income_of_checkout_complete_orders: 0,
        total_income_of_payments_captured: 0,
        count_orders_checkout_completed: 0,
        count_orders_payment_captured: 0,
        count_orders_checkout_created: 0,
        products: {},
        collections: {},
        tags: {},
        discounts: {}
      }

      // update total and number of orders
      if(order.status.checkout.id === CheckoutStatusEnum.complete.id) {
        day_d.count_orders_checkout_completed += 1;
        day_d.total_income_of_checkout_complete_orders += total_order_price;
      }
      if(order.status.checkout.id === CheckoutStatusEnum.created.id) {
        day_d.count_orders_checkout_created += 1;
        day_d.total_income_of_checkout_complete_orders += total_order_price;
      }
      if(order.status.payment.id === PaymentOptionsEnum.captured.id) {
        day_d.count_orders_payment_captured += 1;
        day_d.total_income_of_payments_captured += total_order_price;
      }

      // iterate line items to collect used 
      // products/discounts/collections/tags
      // embedded in the line items
      line_items.forEach(
        li => {

          const { id: id_pr, qty, data } = li;
          const { handle, collections, tags, title } = data ?? {};
          
          // we prefer `handles`
          const id = handle ?? id_pr;

          // products
          day_d.products[id] = day_d.products[id] ?? {
            handle: id, id: id_pr, title, count: 0
          }

          day_d.products[id].count += qty

          // collections
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

          // tags
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

      // discounts
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
