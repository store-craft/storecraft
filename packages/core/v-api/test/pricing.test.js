import { test } from 'uvu';
import * as assert from 'uvu/assert';

const log = console.log

import line_items from './assets/pricing/line_items_1.json' assert { type: 'json' }
import test_bulk_ds_games_3_for_100 from './assets/pricing/test-bulk-ds-games-3-for-99.json' assert { type: 'json' }
import test_order_10_percents_off_above_300 from './assets/pricing/test-order-10-percents-off.json' assert { type: 'json' }
import test_order_fixed_off_order from './assets/pricing/test-order-fixed-off-order.json' assert { type: 'json' }
import test_regular_all_games from './assets/pricing/test-regular-all-games.json' assert { type: 'json' }
import test_regular_ps4_games from './assets/pricing/test-regular-ps4-games.json' assert { type: 'json' }
import test_regular_wii_games from './assets/pricing/test-regular-wii-games.json' assert { type: 'json' }
import test_regular_switch_games from './assets/pricing/test-regular-switch-games.json' assert { type: 'json' }
import { calculate_pricing, lineitems_to_quantity } from '../con.pricing.logic.js';

const shipping = {
  price: 25
}

/**
 * 
 * @param {import('../../types.api.js').LineItem[]} line_items 
 */
const print_line_items = (line_items) => {
  log(`\n\nLine Items (${lineitems_to_quantity(line_items)})`)
  line_items.forEach(
    li => {
      log(`- ${li.id} x ${li.qty} (${li.data?.price ?? li.price})`)
    }
  )

  const total = line_items.reduce(
    (p, c) => p + c.qty * (c?.data?.price ?? c.price), 0
  )

  log('\nTotal: ' + total)
}

test('parse queries', async () => {

  print_line_items(line_items)
  log(`Applying discount`)
  const result = calculate_pricing(
    line_items, [ 
      // test_regular_ps4_games, 
      // test_regular_wii_games, 
      test_bulk_ds_games_3_for_100,
      // test_regular_all_games, 
      // test_order_fixed_off_order,
      // test_order_10_percents_off_above_300
    ], 
    undefined, shipping
  )
  log(result)
});

test.run();