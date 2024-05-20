import 'dotenv/config';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { enums } from '@storecraft/core/v-api';
import { create_title_gen, file_name } from './api.utils.crud.js';
import esMain from './utils.esmain.js';
import { App } from '@storecraft/core';
import { calculate_pricing } from '@storecraft/core/v-api/con.pricing.logic.js';
import { to_handle } from '@storecraft/core/v-api/utils.func.js';


/**
 * About the test:
 * The purpose of this file is to locally test the various discounts:
 * - regular discounts
 * - bundle discounts
 * - buy X get Y discounts
 * - bulk discounts
 * - order discounts
 * 
 * Now, The product that are tested for eligibility by the filters, always use
 * the `tags` filter (as opposed to the many other filters we suuport), The reason
 * being, we already have other tests for testing the validity of passing these
 * filters tests, so in this test suite, we focus on the pricing aspect of the
 * discount.
 * 
 * By the way, the filters validity are tested as part of the `api_product_discounts_test.js`,
 * which consist of end to end (api through database) test fro associating a product to a 
 * discount by it's testing the discount's filters (Using the same code as used here implicitly) 
 * 
 * At first stage, I test the pricing using a single discount at a time.
 * At second stage: 
 * TODO: Stack Discounts
 */

const title_gen = create_title_gen('product')

/**
 * 
 * @param {string} tag 
 * 
 * @returns {import('@storecraft/core/v-api').ProductType} 
 */
const gen_product = (tag='regular') => {
  const title = title_gen();

  return { 
    tags: [tag], 
    qty: 100, 
    active: true, 
    title, 
    handle: to_handle(title),
    price: 100 
  }
}




export const create = () => {

  const s = suite(
    file_name(import.meta.url), 
    {}
  );


  s.before(
    async () => { 
      // assert.ok(app.ready);
    }
  );


  s('regular discount: 10% OFF only', async (ctx) => {

    /** @type {import('@storecraft/core/v-api').DiscountType} */
    const discount_regular = { 
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

    const pricing = calculate_pricing(
      [
        {
          id: 'pr-1', qty: 3, 
          data: { 
            tags: ['regular'], 
            qty: 100, 
            active: true, title: '', 
            price: 100 
          }
        },
        {
          id: 'pr-2', qty: 2, 
          data: { 
            tags: ['regular'], 
            qty: 100, 
            active: true, title: '', 
            price: 100 
          }
        },
        {
          id: 'pr-3', qty: 5, 
          data: { 
            tags: ['would-not-be-discounted'], 
            qty: 100, 
            active: true, title: '', 
            price: 100 
          }
        }

      ],
      [
        discount_regular
      ],
      [],
      {
        title: '',
        handle: '',
        price: 50
      }
    )

    // console.log(pricing)

    const ok = (
      pricing.subtotal_discount==50 &&
      pricing.subtotal_undiscounted==1000 &&
      pricing.subtotal==950 &&
      pricing.total==1000 &&
      pricing.quantity_total==10 &&
      pricing.quantity_discounted==5
    );

    assert.ok(
      ok,
      'discount validation has not passed'
    )

  });
  

  s('bulk discount: 3 for 100 recursive ', async (ctx) => {

    /** @type {import('@storecraft/core/v-api').DiscountType} */
    const discount_bulk_3_for_100_recursive = { 
      active: true, 
      handle: 'discount-bulk', 
      title: '3 for 100 recursive for Bulk tags',
      priority: 0, 
      application: enums.DiscountApplicationEnum.Auto, 
      info: {
        details: {
          meta: enums.DiscountMetaEnum.bulk,
          /** @type {import('@storecraft/core/v-api').BulkDiscountExtra} */
          extra: {
            qty: 3,
            percent: 100,
            fixed: 100,
            recursive: true
          }
        },
        filters: [
          { // discount for a specific product handle
            meta: enums.FilterMetaEnum.p_in_tags,
            /** @type {import('@storecraft/core/v-api').FilterValue_p_in_tags} */
            value: ['bulk']
          }
        ]
      }
    }    

    /**
     * This test interleaves bulk items to be applied recursively
     */
    const pricing = calculate_pricing(
      [
        {
          id: 'pr-1', qty: 3, 
          data: { 
            tags: ['bulk'], 
            qty: 100, 
            active: true, title: '', 
            price: 100 
          }
        },
        {
          id: 'pr-avoid', qty: 5, 
          data: { 
            tags: ['would-not-be-discounted'], 
            qty: 100, 
            active: true, title: '', 
            price: 100 
          }
        },
        {
          id: 'pr-2', qty: 2, 
          data: { 
            tags: ['bulk'], 
            qty: 100, 
            active: true, title: '', 
            price: 100 
          }
        },
        {
          id: 'pr-3', qty: 1, 
          data: { 
            tags: ['bulk'], 
            qty: 100, 
            active: true, title: '', 
            price: 100 
          }
        },

      ],
      [
        discount_bulk_3_for_100_recursive
      ],
      [],
      {
        title: '',
        handle: '',
        price: 50
      }
    )

    // console.log(pricing)

    const ok = (
      pricing.subtotal_discount==400 &&
      pricing.subtotal_undiscounted==1100 &&
      pricing.subtotal==700 &&
      pricing.total==750 &&
      pricing.quantity_total==11 &&
      pricing.quantity_discounted==6
    );

    assert.ok(
      ok,
      'discount validation has not passed'
    )

  });  


  s('bulk discount: 3 for 100 NON recursive ', async (ctx) => {

    /** @type {import('@storecraft/core/v-api').DiscountType} */
    const discount_bulk_3_for_100_recursive = { 
      active: true, 
      handle: 'discount-bulk', 
      title: '3 for 100 recursive for Bulk tags',
      priority: 0, 
      application: enums.DiscountApplicationEnum.Auto, 
      info: {
        details: {
          meta: enums.DiscountMetaEnum.bulk,
          /** @type {import('@storecraft/core/v-api').BulkDiscountExtra} */
          extra: {
            qty: 3,
            percent: 100,
            fixed: 100,
            recursive: false
          }
        },
        filters: [
          { // discount for a specific product handle
            meta: enums.FilterMetaEnum.p_in_tags,
            /** @type {import('@storecraft/core/v-api').FilterValue_p_in_tags} */
            value: ['bulk']
          }
        ]
      }
    }    

    /**
     * This test interleaves bulk items to be applied recursively
     */
    const pricing = calculate_pricing(
      [
        {
          id: 'pr-1', qty: 3, 
          data: { 
            tags: ['bulk'], 
            qty: 100, 
            active: true, title: '', 
            price: 100 
          }
        },
        {
          id: 'pr-avoid', qty: 5, 
          data: { 
            tags: ['would-not-be-discounted'], 
            qty: 100, 
            active: true, title: '', 
            price: 100 
          }
        },
        {
          id: 'pr-2', qty: 2, 
          data: { 
            tags: ['bulk'], 
            qty: 100, 
            active: true, title: '', 
            price: 100 
          }
        },
        {
          id: 'pr-3', qty: 1, 
          data: { 
            tags: ['bulk'], 
            qty: 100, 
            active: true, title: '', 
            price: 100 
          }
        },

      ],
      [
        discount_bulk_3_for_100_recursive
      ],
      [],
      {
        title: '',
        handle: '',
        price: 50
      }
    )

    // console.log(pricing)

    const ok = (
      pricing.subtotal_discount==200 &&
      pricing.subtotal_undiscounted==1100 &&
      pricing.subtotal==900 &&
      pricing.total==950 &&
      pricing.quantity_total==11 &&
      pricing.quantity_discounted==3
    );

    assert.ok(
      ok,
      'discount validation has not passed'
    )

  });  


  s('bundle discount: 50% OFF Bundle: robot arms and legs (not recursive)', async (ctx) => {

    /** @type {import('@storecraft/core/v-api').DiscountType} */
    const discount_regular = { 
      active: true, 
      handle: 'discount-bundle-50-off-robot-arms-and-legs-not-recursive', 
      title: '50% OFF Bundle: robot arms and legs (not recursive)',
      priority: 0, 
      application: enums.DiscountApplicationEnum.Auto, 
      info: {
        details: {
          meta: enums.DiscountMetaEnum.bundle,
          /** @type {import('@storecraft/core/v-api').BundleDiscountExtra} */
          extra: {
            fixed: 0, percent: 50, recursive: false
          }
        },
        filters: [ // in bundle, each filter is part of the bundle
          { 
            meta: enums.FilterMetaEnum.p_in_tags,
            /** @type {import('@storecraft/core/v-api').FilterValue_p_in_tags} */
            value: ['robot_arm']
          },
          { 
            meta: enums.FilterMetaEnum.p_in_tags,
            /** @type {import('@storecraft/core/v-api').FilterValue_p_in_tags} */
            value: ['robot_leg']
          }

        ]
      }
    }    

    const pricing = calculate_pricing(
      [
        {
          id: 'robot-leg-white', qty: 3, 
          data: { 
            tags: ['robot_leg'], 
            qty: 100, 
            active: true, title: '', 
            price: 100 
          }
        },
        {
          id: 'just-for-disruption', qty: 5, 
          data: { 
            tags: ['would-not-be-discounted'], 
            qty: 100, 
            active: true, title: '', 
            price: 100 
          }
        },
        {
          id: 'robot-arm-red', qty: 2, 
          data: { 
            tags: ['robot_arm'], 
            qty: 100, 
            active: true, title: '', 
            price: 100 
          }
        },
        {
          id: 'robot-arm-green', qty: 1, 
          data: { 
            tags: ['robot_arm'], 
            qty: 100, 
            active: true, title: '', 
            price: 100 
          }
        },

      ],
      [
        discount_regular
      ],
      [],
      {
        title: '',
        handle: '',
        price: 50
      }
    )

    // console.log(JSON.stringify(discount_regular, null, 2))
    // console.log(pricing)

    const ok = (
      pricing.subtotal_discount==100 &&
      pricing.subtotal_undiscounted==1100 &&
      pricing.subtotal==1000 &&
      pricing.total==1050 &&
      pricing.quantity_total==11 &&
      pricing.quantity_discounted==2
    );

    assert.ok(
      ok,
      'discount validation has not passed'
    )

  });

  
  s('bundle discount: 50% OFF Bundle: robot arms and legs (recursive as much as possible)', async (ctx) => {

    /** @type {import('@storecraft/core/v-api').DiscountType} */
    const discount_regular = { 
      active: true, 
      handle: 'discount-bundle-50-off-robot-arms-and-legs-recursive', 
      title: '50% OFF Bundle: robot arms and legs (recursive as much as possible)',
      priority: 0, 
      application: enums.DiscountApplicationEnum.Auto, 
      info: {
        details: {
          meta: enums.DiscountMetaEnum.bundle,
          /** @type {import('@storecraft/core/v-api').BundleDiscountExtra} */
          extra: {
            fixed: 0, percent: 50, recursive: true
          }
        },
        filters: [ // in bundle, each filter is part of the bundle
          { 
            meta: enums.FilterMetaEnum.p_in_tags,
            /** @type {import('@storecraft/core/v-api').FilterValue_p_in_tags} */
            value: ['robot_arm']
          },
          { 
            meta: enums.FilterMetaEnum.p_in_tags,
            /** @type {import('@storecraft/core/v-api').FilterValue_p_in_tags} */
            value: ['robot_leg']
          }

        ]
      }
    }    

    const pricing = calculate_pricing(
      [
        {
          id: 'robot-leg-white', qty: 3, 
          data: { 
            tags: ['robot_leg'], 
            qty: 100, 
            active: true, title: '', 
            price: 100 
          }
        },
        {
          id: 'just-for-disruption', qty: 5, 
          data: { 
            tags: ['would-not-be-discounted'], 
            qty: 100, 
            active: true, title: '', 
            price: 100 
          }
        },
        {
          id: 'robot-arm-red', qty: 2, 
          data: { 
            tags: ['robot_arm'], 
            qty: 100, 
            active: true, title: '', 
            price: 100 
          }
        },
        {
          id: 'robot-arm-green', qty: 2, 
          data: { 
            tags: ['robot_arm'], 
            qty: 100, 
            active: true, title: '', 
            price: 100 
          }
        },

      ],
      [
        discount_regular
      ],
      [],
      {
        title: '',
        handle: '',
        price: 50
      }
    )

    // console.log(pricing)

    const ok = (
      pricing.subtotal_discount==300 &&
      pricing.subtotal_undiscounted==1200 &&
      pricing.subtotal==900 &&
      pricing.total==950 &&
      pricing.quantity_total==12 &&
      pricing.quantity_discounted==6
    );

    assert.ok(
      ok,
      'discount validation has not passed'
    )

  });


  s('buy X get Y discount: Buy 2 robot legs -> Get 1 Robot arms for 50% OFF, only once not recursive', async (ctx) => {

    /** @type {import('@storecraft/core/v-api').DiscountType} */
    const discount_regular = { 
      active: true, 
      handle: '', 
      title: 'buy X get Y discount: Buy 2 robot legs -> Get 1 Robot arms for 50% OFF (ONCE, NOT Recursive)',
      priority: 0, 
      application: enums.DiscountApplicationEnum.Auto, 
      info: {
        details: {
          meta: enums.DiscountMetaEnum.buy_x_get_y,
          /** @type {import('@storecraft/core/v-api').BuyXGetYDiscountExtra} */
          extra: {
            fixed: 0, percent: 50,
            recursive: false,
            qty_x: 2,
            qty_y: 1,
            filters_y: [
              { 
                meta: enums.FilterMetaEnum.p_in_tags,
                /** @type {import('@storecraft/core/v-api').FilterValue_p_in_tags} */
                value: ['robot_arm']
              },
            ]

          }
        },
        filters: [ // in bundle, each filter is part of the bundle
          { 
            meta: enums.FilterMetaEnum.p_in_tags,
            /** @type {import('@storecraft/core/v-api').FilterValue_p_in_tags} */
            value: ['robot_leg']
          },
        ]
      }
    }    

    const pricing = calculate_pricing(
      [
        {
          id: 'robot-leg-white', qty: 3, 
          data: { 
            tags: ['robot_leg'], 
            qty: 100, 
            active: true, title: '', 
            price: 100 
          }
        },
        {
          id: 'just-for-disruption', qty: 5, 
          data: { 
            tags: ['would-not-be-discounted'], 
            qty: 100, 
            active: true, title: '', 
            price: 100 
          }
        },
        {
          id: 'robot-arm-red', qty: 2, 
          data: { 
            tags: ['robot_arm'], 
            qty: 100, 
            active: true, title: '', 
            price: 100 
          }
        },
      ],
      [
        discount_regular
      ],
      [],
      {
        title: '',
        handle: '',
        price: 50
      }
    )

    // console.log(pricing)

    const ok = (
      pricing.subtotal_discount==50 &&
      pricing.subtotal_undiscounted==1000 &&
      pricing.subtotal==950 &&
      pricing.total==1000 &&
      pricing.quantity_total==10 &&
      pricing.quantity_discounted==3
    );

    assert.ok(
      ok,
      'discount validation has not passed'
    )

  });


  s('buy X get Y discount: Buy 1 robot legs -> Get 1 Robot arms for 50% OFF, recursive, applied as much as possible', async (ctx) => {

    /** @type {import('@storecraft/core/v-api').DiscountType} */
    const discount_regular = { 
      active: true, 
      handle: '', 
      title: 'buy X get Y discount: Buy 1 robot legs -> Get 1 Robot arms for 50% OFF, recursive, applied as much as possible',
      priority: 0, 
      application: enums.DiscountApplicationEnum.Auto, 
      info: {
        details: {
          meta: enums.DiscountMetaEnum.buy_x_get_y,
          /** @type {import('@storecraft/core/v-api').BuyXGetYDiscountExtra} */
          extra: {
            fixed: 0, percent: 50,
            recursive: true,
            qty_x: 1,
            qty_y: 1,
            filters_y: [
              { 
                meta: enums.FilterMetaEnum.p_in_tags,
                /** @type {import('@storecraft/core/v-api').FilterValue_p_in_tags} */
                value: ['robot_arm']
              },
            ]

          }
        },
        filters: [ // in bundle, each filter is part of the bundle
          { 
            meta: enums.FilterMetaEnum.p_in_tags,
            /** @type {import('@storecraft/core/v-api').FilterValue_p_in_tags} */
            value: ['robot_leg']
          },
        ]
      }
    }    

    const pricing = calculate_pricing(
      [
        {
          id: 'robot-leg-white', qty: 3, 
          data: { 
            tags: ['robot_leg'], 
            qty: 100, 
            active: true, title: '', 
            price: 100 
          }
        },
        {
          id: 'just-for-disruption', qty: 5, 
          data: { 
            tags: ['would-not-be-discounted'], 
            qty: 100, 
            active: true, title: '', 
            price: 100 
          }
        },
        {
          id: 'robot-arm-red', qty: 2, 
          data: { 
            tags: ['robot_arm'], 
            qty: 100, 
            active: true, title: '', 
            price: 100 
          }
        },
        {
          id: 'robot-arm-green', qty: 2, 
          data: { 
            tags: ['robot_arm'], 
            qty: 100, 
            active: true, title: '', 
            price: 100 
          }
        },
      ],
      [
        discount_regular
      ],
      [],
      {
        title: '',
        handle: '',
        price: 50
      }
    )

    // console.log(pricing)

    const ok = (
      pricing.subtotal_discount==150 &&
      pricing.subtotal_undiscounted==1200 &&
      pricing.subtotal==1050 &&
      pricing.total==1100 &&
      pricing.quantity_total==12 &&
      pricing.quantity_discounted==6
    );

    assert.ok(
      ok,
      'discount validation has not passed'
    )

  });


  s('order discount: 10% OFF IF order subtotal >= 300', async (ctx) => {

    /** @type {import('@storecraft/core/v-api').DiscountType} */
    const discount = { 
      active: true, 
      handle: 'discount-10-off-order', 
      title: '10% OFF Order with sub-total >= 300',
      priority: 0, 
      application: enums.DiscountApplicationEnum.Auto, 
      info: {
        details: {
          meta: enums.DiscountMetaEnum.order,
          /** @type {import('@storecraft/core/v-api').OrderDiscountExtra} */
          extra: {
            fixed: 0, percent: 10
          }
        },
        filters: [
          { // discount for a specific product handle
            meta: enums.FilterMetaEnum.o_subtotal_in_range,
            /** @type {import('@storecraft/core/v-api').FilterValue_o_subtotal_in_range} */
            value: {
              from: 300
            }
          }
        ]
      }
    }    

    { // above >= 300
      const pricing = calculate_pricing(
        [
          {
            id: 'pr-1', qty: 3, 
            data: { 
              tags: ['regular'], 
              qty: 100, 
              active: true, title: '', 
              price: 100 
            }
          },
          {
            id: 'pr-2', qty: 2, 
            data: { 
              tags: ['regular'], 
              qty: 100, 
              active: true, title: '', 
              price: 100 
            }
          },
          {
            id: 'pr-3', qty: 5, 
            data: { 
              tags: ['would-not-be-discounted'], 
              qty: 100, 
              active: true, title: '', 
              price: 100 
            }
          }
  
        ],
        [
          discount
        ],
        [],
        {
          title: '',
          handle: '',
          price: 50
        }
      )
  
      // console.log(pricing)
  
      const ok = (
        pricing.subtotal_discount==100
      );
  
      assert.ok(
        ok,
        'discount validation has not passed'
      )
    }


    { // < 300
      const pricing = calculate_pricing(
        [
          {
            id: 'pr-1', qty: 3, 
            data: { 
              tags: ['regular'], 
              qty: 100, 
              active: true, title: '', 
              price: 10 
            }
          },
          {
            id: 'pr-2', qty: 2, 
            data: { 
              tags: ['regular'], 
              qty: 100, 
              active: true, title: '', 
              price: 10
            }
          },
          {
            id: 'pr-3', qty: 5, 
            data: { 
              tags: ['would-not-be-discounted'], 
              qty: 100, 
              active: true, title: '', 
              price: 10
            }
          }
  
        ],
        [
          discount
        ],
        [],
        {
          title: '',
          handle: '',
          price: 50
        }
      )
  
      // console.log(pricing)
  
      const ok = (
        pricing.subtotal_discount==0
      );
  
      assert.ok(
        ok,
        'discount validation has not passed'
      )
    }


  });


  s('order discount: 10% OFF IF order In the Next 60 seconds', async (ctx) => {

    /** @satisfies {import('@storecraft/core/v-api').DiscountType} */
    const discount = { 
      active: true, 
      handle: '', 
      title: 'order discount: 10% OFF IF order In the Next 60 seconds',
      priority: 0, 
      application: enums.DiscountApplicationEnum.Auto, 
      info: {
        details: {
          meta: enums.DiscountMetaEnum.order,
          /** @type {import('@storecraft/core/v-api').OrderDiscountExtra} */
          extra: {
            fixed: 0, percent: 10
          }
        },
        filters: [
          { // discount for a specific product handle
            meta: enums.FilterMetaEnum.o_date_in_range,
            /** @type {import('@storecraft/core/v-api').FilterValue_o_date_in_range} */
            value: {
              from: (new Date(Date.now() - 1000)).toISOString(),
              to: (new Date(Date.now() + 1000*60)).toISOString()
            }
          }
        ]
      }
    }    

    { // order in date range
      const pricing = calculate_pricing(
        [
          {
            id: 'pr-1', qty: 3, 
            data: { 
              qty: 100, 
              active: true, title: '', 
              price: 100 
            }
          },
        ],
        [
          discount
        ],
        [],
        {
          title: '',
          handle: '',
          price: 50
        }
      )
  
      const ok = (
        pricing.subtotal_discount==30
      );
  
      assert.ok(
        ok,
        'discount validation has not passed'
      )
    }


    { // order NOT in date range

      discount.info.filters[0].value = {
        to: (new Date(0)).toISOString()
      }

      const pricing = calculate_pricing(
        [
          {
            id: 'pr-1', qty: 3, 
            data: { 
              qty: 100, 
              active: true, title: '', 
              price: 100 
            }
          },
        ],
        [
          discount
        ],
        [],
        {
          title: '',
          handle: '',
          price: 50
        }
      )

      // console.log(pricing)
  
      const ok = (
        pricing.subtotal_discount==0
      );
  
      assert.ok(
        ok,
        'discount validation has not passed'
      )
    }

  });


  s('order discount: 10% OFF IF Items count >= 10', async (ctx) => {

    /** @type {import('@storecraft/core/v-api').DiscountType} */
    const discount = { 
      active: true, 
      handle: '', 
      title: 'order discount: 10% OFF IF Items count >= 10',
      priority: 0, 
      application: enums.DiscountApplicationEnum.Auto, 
      info: {
        details: {
          meta: enums.DiscountMetaEnum.order,
          /** @type {import('@storecraft/core/v-api').OrderDiscountExtra} */
          extra: {
            fixed: 0, percent: 10
          }
        },
        filters: [
          { // discount for a specific product handle
            meta: enums.FilterMetaEnum.o_items_count_in_range,
            /** @type {import('@storecraft/core/v-api').FilterValue_o_items_count_in_range} */
            value: {
              from: 10
            }
          }
        ]
      }
    }    

    { // items count >= 10
      const pricing = calculate_pricing(
        [
          {
            id: 'pr-1', qty: 3, 
            data: { 
              tags: ['regular'], 
              qty: 100, 
              active: true, title: '', 
              price: 100 
            }
          },
          {
            id: 'pr-2', qty: 2, 
            data: { 
              tags: ['regular'], 
              qty: 100, 
              active: true, title: '', 
              price: 100 
            }
          },
          {
            id: 'pr-3', qty: 5, 
            data: { 
              tags: ['would-not-be-discounted'], 
              qty: 100, 
              active: true, title: '', 
              price: 100 
            }
          }
  
        ],
        [
          discount
        ],
        [],
        {
          title: '',
          handle: '',
          price: 50
        }
      )
  
      const ok = (
        pricing.subtotal_discount==100
      );
  
      assert.ok(
        ok,
        'discount validation has not passed'
      )
    }


    { // items count < 10
      const pricing = calculate_pricing(
        [
          {
            id: 'pr-1', qty: 3, 
            data: { 
              tags: ['regular'], 
              qty: 100, 
              active: true, title: '', 
              price: 10 
            }
          },
        ],
        [
          discount
        ],
        [],
        {
          title: '',
          handle: '',
          price: 50
        }
      )
  
      // console.log(pricing)
  
      const ok = (
        pricing.subtotal_discount==0
      );
  
      assert.ok(
        ok,
        'discount validation has not passed'
      )
    }


  });


  s('order discount: 10% OFF For a specific customers', async (ctx) => {

    /** @type {import('@storecraft/core/v-api').DiscountType} */
    const discount = { 
      active: true, 
      handle: '', 
      title: 'order discount: 10% OFF For a specific customers',
      priority: 0, 
      application: enums.DiscountApplicationEnum.Auto, 
      info: {
        details: {
          meta: enums.DiscountMetaEnum.order,
          /** @type {import('@storecraft/core/v-api').OrderDiscountExtra} */
          extra: {
            fixed: 0, percent: 10
          }
        },
        filters: [
          { // discount for a specific product handle
            meta: enums.FilterMetaEnum.o_has_customer,
            /** @type {import('@storecraft/core/v-api').FilterValue_o_has_customers} */
            value: [
              {
                id: 'cus_ID_i_promised_a_discount_to'
              },
            ]
          }
        ]
      }
    }    

    { // eligible customer
      const pricing = calculate_pricing(
        [
          {
            id: 'pr-1', qty: 3, 
            data: { 
              tags: ['regular'], 
              qty: 100, 
              active: true, title: '', 
              price: 100 
            }
          },
        ],
        [
          discount
        ],
        [],
        {
          title: '',
          handle: '',
          price: 50
        }, 
        'cus_ID_i_promised_a_discount_to'
      );
  
      const ok = (
        pricing.subtotal_discount==30
      );
  
      assert.ok(
        ok,
        'discount validation has not passed'
      )
    }


    { // NON eligible customer
      const pricing = calculate_pricing(
        [
          {
            id: 'pr-1', qty: 3, 
            data: { 
              tags: ['regular'], 
              qty: 100, 
              active: true, title: '', 
              price: 100 
            }
          },
        ],
        [
          discount
        ],
        [],
        {
          title: '',
          handle: '',
          price: 50
        }, 
        'cus_not_eligible'
      );
  
      const ok = (
        pricing.subtotal_discount==0
      );
  
      assert.ok(
        ok,
        'discount validation has not passed'
      )
    }


  });


  return s;
}


(async function inner_test() {
  // helpful for direct inner tests
  if(!esMain(import.meta)) return;
  try {
    // const { create_app } = await import('./play.js');
    // const app = await create_app();
    const s = create();
    s.run();
  } catch (e) {
  }
})();
