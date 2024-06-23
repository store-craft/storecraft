import 'dotenv/config';
import { join } from "node:path";
import { homedir } from "node:os";

import { NodePlatform } from '@storecraft/platform-node'
import { MongoDB } from '@storecraft/database-mongodb-node'
import { NodeLocalStorage } from '@storecraft/storage-node-local'
import { R2 } from '@storecraft/storage-s3-compatible'
import { GoogleStorage } from '@storecraft/storage-google'
import { PaypalStandard } from '@storecraft/payments-paypal-standard'
import { DummyPayments } from '@storecraft/payments-dummy'
import { App } from '@storecraft/core';
import { enums } from '@storecraft/core/v-api';
 
export const app = new App(
  new NodePlatform(),
  new MongoDB({ db_name: 'test' }),
  new NodeLocalStorage(join(homedir(), 'tomer'))
  // new R2(process.env.R2_BUCKET, process.env.R2_ACCOUNT_ID, process.env.R2_ACCESS_KEY_ID, process.env.R2_SECRET_ACCESS_KEY )
  // new GoogleStorage()
  ,
  null,
  {
    storage_rewrite_urls: undefined,
    general_store_name: 'Wush Wush Games',
    general_store_description: 'We sell cool retro video games',
    general_store_website: 'https://wush.games'
  }
).withPaymentGateways(
  {
    'paypal_standard': new PaypalStandard({ client_id: 'blah', secret: 'blah 2', env: 'prod' }),
    'dummy_payments': new DummyPayments({ intent_on_checkout: 'AUTHORIZE' })
  }
).withExtensions(
  {
    'events': { 
      config: '',
      onInit: undefined,
      info: {name:'tomer'},
      actions: [
        {handle:'t', name:'rr'}
      ],
      invokeAction: (handle) => {return null;}
    }
  }
);

const id = await app.api.products.upsert(
  {
    active: true, 
    title: 'A White Shirt',
    price: 50,
    qty: 10,
    handle: 'a-white-shirt',
    collections: [
      {
        handle: 'a', id:'a'
      }
    ],
    variant_hint,
    parent_handle
  }
)

/**
 * @typedef {import('@storecraft/core/v-api').ApiQuery} dd
 */
//
//&order=desc&sortBy=(updated_at,id)&expand=(*)&limit=5
const products = await app.api.products.list(
  {
    startAfter: [
      ['updated_at', '2024-06-13T08:51:52.202Z']
    ],
    order: 'desc',
    sortBy: [
      'updated_at'
    ],
    limit: 5
  }
)

const id = await app.api.discounts.list_discounts_products();


/** @type {import('@storecraft/core/v-api').DiscountType} */
const discount_regular = { 
  id: '',
  active: true, 
  handle: 'discount-10-off-regular', 
  title: '10% OFF Regular tags',
  priority: 0, 
  application: enums.DiscountApplicationEnum.Auto, 
  info: {
    details: {
      meta: enums.DiscountMetaEnum.regular,
      /** @type {import('@storecraft/core/v-api').RegularDiscountExtra} */
      extra: {
        fixed: 0, percent: 10
      }
    },
    filters: [
      { // discount for a specific product handle
        meta: enums.FilterMetaEnum.p_in_tags,
        /** @type {import('@storecraft/core/v-api').FilterValue_p_in_tags} */
        value: ['regular']
      }
    ]
  }
}    
