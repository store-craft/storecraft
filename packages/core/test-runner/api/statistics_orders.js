/**
 * @import { LineItem, OrderDataUpsert } from '../../api/types.api.js'
 * @import { Test } from 'uvu';
 */
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { file_name, promises_sequence } from './api.utils.crud.js';
import { enums } from '../../api/index.js';
import esMain from './utils.esmain.js';
import { App } from '../../index.js';
import { ID } from '../../api/utils.func.js';
import { endOfDay, startOfDay } from '../../api/con.statistics.logic.js';


/** @return {LineItem} */
const gen_line_item = (ix = 0) => {
  const id = ID('pr');
  return {
    id: id,
    qty: 1,
    data: {
      active: true,
      id: id,
      handle: 'product-' + ix,
      title: 'Product ' + ix,
      tags: ['tag_' + ix],
      collections: [
        {
          handle: 'collection-' + ix,
          title: 'Collection ' + ix,
          active: true,
          id: 'collection-' + ix
        }
      ],
      price: 100,
      qty: 15
    }
  }
}

const DAYS_COUNT = 10;

const gen_date = (ix = 0) => {
  return new Date(2025, 0, ix + 1 - DAYS_COUNT);
}

const gen_order = (ix = 0) => {
  return /** @type {OrderDataUpsert} */({
    status: {
      checkout: enums.CheckoutStatusEnum.complete,
      payment: enums.PaymentOptionsEnum.authorized,
      fulfillment: enums.FulfillOptionsEnum.draft
    },
    created_at: gen_date(ix).toISOString(),
    pricing: {
      evo: [ // only one item discounted
        {
          discount_code: 'discount-code-' + ix,
          discount: {
            active: true,
            title: 'Discount ' + ix,
            handle: 'discount-code-' + ix,
            id: ID('dis')
          },
          total_discount: 10,
          quantity_discounted: 1,
          quantity_undiscounted: ix,
        },
      ],
      subtotal_discount: 10,
      subtotal_undiscounted: (ix * 100),
      subtotal: (ix * 100) - 10,
      total: (ix * 100) - 10 + 30,
      quantity_total: ix + 1,
      quantity_discounted: 1,
    },
    line_items: Array.from({ length: ix + 1 }).map(
      (_, ix) => gen_line_item(ix)
    ),
    shipping_method: {
      handle: 'ship-a', title: 'ship a', price: 30, id: ID('ship')
    }
  })
}



/**
 * @param {App} app 
 */
export const create = app => {

  const s = suite(
    file_name(import.meta.url), 
  );

  let order_ids;

  s.before(async () => {

    order_ids = await promises_sequence(
      Array.from({ length: DAYS_COUNT }).map(
        (_, ix) => [
          () => app.api.orders.upsert(gen_order(ix)),
          () => app.api.orders.upsert(gen_order(ix))
        ]
      ).flat()
    )
    .catch(console.error);

    // console.log({order_ids})
  });

  // return s;
  s.after(async () => {
    for (const id of order_ids) {
      await app.api.orders.remove(id).catch(console.error);
    }
  });

  s('statistics of orders', async () => { 
    const stats = await app.api.statistics.compute_statistics(
      gen_date(0), gen_date(DAYS_COUNT - 1)
    );

    // console.log({stats})

    assert.ok(stats, 'stats');
    assert.equal(stats.count_days, DAYS_COUNT, 'days count');
    assert.equal(
      new Date(stats.from_day).getTime(), 
      startOfDay(gen_date(0)).getTime(),
      'from day is not matching to range start of day'
    );
    assert.equal(
      new Date(stats.to_day).getTime(), 
      endOfDay(gen_date(DAYS_COUNT - 1)).getTime(), 'to day is not matching to range end of day'
    );

    assert.equal(Object.keys(stats.days).length, DAYS_COUNT, 'days length');

    const entries = Object.entries(stats.days);

    // console.dir({entries}, {depth: 5});

    // test that each item has a count of 2
    for (const [day, stat] of entries) {
      assert.ok(stat, 'stat');
      assert.equal(stat.metrics.checkouts_completed.count, 2, 'count_orders');

      for (const [handle, product] of Object.entries(stat.products)) {
        assert.equal(
          product.count, 2, 
          `product with handle ${handle} failed !! count should equal 2 for any day`
        );
      }
      for (const [handle, collection] of Object.entries(stat.collections)) {
        assert.equal(
          collection.count, 2, 
          `collection with handle ${handle} failed !! count should equal 2 for any day`
        );
      }
      for (const [handle, tag] of Object.entries(stat.tags)) {
        assert.equal(
          tag.count, 2, 
          `tag with handle ${handle} failed !! count should equal 2 for any day`
        );
      }
      for (const [handle, discount] of Object.entries(stat.discounts)) {
        assert.equal(
          discount.count, 2, 
          `discount with ${handle} failed !! count should equal 2 for any day`
        );
      }
    }

    // now test days are unique
    const days = new Set(entries.map(entry => entry[0]));
    assert.equal(
      days.size, DAYS_COUNT, 
      'days have duplicates, very bad !!'
    );

    { // now let's go over each day and check it is equal to 
      // the start of it's day and is in the range.
      const startDate = startOfDay(gen_date(0));
      const endDate = startOfDay(gen_date(DAYS_COUNT - 1));

      for(const day of days) {
        const as_date = new Date(day);
        assert.ok(
          startOfDay(day).getTime()===as_date.getTime(), 
          `We found that day ${day} is not floored to the start of the day`
        );
  
        assert.ok(
          as_date.getTime()>=startDate.getTime() &&
          as_date.getTime()<=endDate.getTime(), 
          `We found that day ${day} is not in the range of the days of 
          ${startDate.toISOString()} and 
          ${endDate.toISOString()}`
        );
        
      }
    }

    // console.log(JSON.stringify(stats))

  });


  return s;
}

(async function inner_test() {
  // helpful for direct inner tests
  if(!esMain(import.meta)) return;
  try {
    const { create_app } = await import('../../app.test.fixture.js');
    const app = await create_app(false);
    const s = create(app);
    s.after(async () => { await app.db.disconnect() });
    s.run();
  } catch (e) {
  }
})();
