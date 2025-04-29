import React from 'react'
import Table from './table'

const base_props = [
  ['description', 'string'],
  ['active', 'boolean'],
  ['created_at', 'string'],
  ['updated_at', 'string'],
  ['id', 'string'],
  ['handle', 'string'],
];

const data = [
  {
    name: 'auth_users',
    properties: [
      ...base_props,
      ['email', 'string'],
      ['confirmed_mail', 'boolean'],
      ['firstname', 'string'],
      ['lastname', 'string'],
    ],
    search: [
      ['id', 'au_123456789'],
      ['tags', 'tag:whatever'],
      ['roles', 'role:admin'],
    ]
  },
  {
    name: 'tags',
    properties: [
      ...base_props,
    ],
    search: [
      ['id', 'tag_123456789'],
      ['handle', 'genre'],
      ['values', 'action, adventure, puzzle'],
    ]
  },
  {
    name: 'collections',
    properties: [
      ...base_props,
      ['title', 'string'],
    ],
    search: [
      ['tags', 'tag:sony'],
      ['id', 'col_123456789'],
      ['handle', 'playstation-games'],
      ['title', 'playstation games, playstation, games'],
    ]
  },
  {
    name: 'shipping_methods',
    properties: [
      ...base_props,
      ['title', 'string'],
      ['price', 'number'],
    ],
    search: [
      ['tags', 'tag:fast'],
      ['id', 'ship_123456789'],
      ['handle', 'express-delivery'],
      ['title', 'Express delivery, express, delivery'],
    ]
  },
  {
    name: 'posts',
    properties: [
      ...base_props,
      ['title', 'string'],
      ['text', 'string'],
    ],
    search: [
      ['tags', 'tag:best-customer'],
      ['id', 'post_123456789'],
      ['handle', 'how-to-buy'],
      ['title', 'how to buy, how, buy'],
    ]
  },
  {
    name: 'customers',
    properties: [
      ...base_props,
      ['auth_id', 'string'],
      ['firstname', 'string'],
      ['lastname', 'string'],
      ['email', 'string'],
      ['phone_number', 'string'],
    ],
    search: [
      ['tags', 'tag:best-customer'],
      ['id', 'cus_123456789'],
      ['handle', 'john@doe.com'],
      ['firstname', 'john'],
      ['lastname', 'doe'],
      ['email', 'john@doe.com'],
      ['auth_id', 'au_123456789'],
    ]
  },
  {
    name: 'orders',
    properties: [
      ...base_props,
    ],
    search: [
      ['tags', 'tag:reviewed'],
      ['id', 'order_123456789'],
      ['contact\'s firstname', 'john'],
      ['contact\'s lastname', 'doe'],
      ['contact\'s customer id', 'customer:cus_123456789, cus_123456789'],
      ['contact\'s email', 'customer:john@doe.com, john@doe.com'],
      ['pricing total', '29, 199'],

      ['payment status id', 'payment:0, payment:1 | payment:2 | payment:3 | payment:4 | payment:5 | payment:6 | payment:7 | payment:8 | payment:9'],
      ['payment status name', 'payment:unpaid | payment:authorized | payment:captured | payment:requires_auth | payment:voided | payment:failed | payment:partially_paid | payment:refunded | payment:partially_refunded | payment:cancelled'],

      ['fulfillment status id', 'fulfill:0 | fulfill:1 | fulfill:2 | fulfill:3 | fulfill:4'],
      ['fulfillment status name', 'fulfill:draft | fulfill:processing | fulfill:shipped | fulfill:fulfilled | fulfill:cancelled'],
      
      ['checkout status id', 'checkout:0 | checkout:1 | checkout:2 | checkout:3 | checkout:4'],
      ['checkout status name', 'checkout:created | checkout:requires_action | checkout:failed | checkout:complete | checkout:unknown,'],
      
      ['applied discounts with code', 'discount:buy-2-get-1-free'],

      ['line items products ids', 'li:pr_123456789'],
      ['line items products handles', 'li:super-mario-switch'],
      
    ]
  },
  {
    name: 'notifications',
    properties: [
      ...base_props,
      ['message', 'string'],
      ['author', 'string'],
    ],
    search: [
      ['author', 'author:-sales-bot'],
      ['search', 'basically everything in search array']
    ]
  },
  {
    name: 'images',
    properties: [
      ...base_props,
      ['name', 'string'],
      ['url', 'string'],
    ],
    search: [
      ['id', 'img_123456789'],
      ['name', 'super-mario.png'],
    ]
  },  
  {
    name: 'discounts',
    properties: [
      ...base_props,
      ['title', 'string'],
      ['priority', 'number'],
    ],
    search: [
      ['tags', 'tag:great-coupon'],
      ['id', 'dis_123456789'],
      ['handle', 'flash-sale-10-off'],
      ['title', 'flash sale, 10% off, flash, sale'],
      ['Discount application method id', 'app:0 | app:1'],
      ['Discount application method name', 'app:automatic | app:manual'],
      ['Discount Type', 'type:regular | type:bulk | type:buy_x_get_y | type:order | type:bundle'],
    ]
  },
  {
    name: 'templates',
    properties: [
      ...base_props,
      ['title', 'string'],
    ],
    search: [
      ['tags', 'tag:template-sale'],
      ['id', 'template_123456789, id:template_123456789'],
      ['handle', 'welcome-customer, handle:welcome-customer'],
      ['title', 'welcome customer, welcome, customer'],
    ]
  },
  {
    name: 'storefronts',
    properties: [
      ...base_props,
      ['title', 'string'],
    ],
    search: [
      ['tags', 'tag:storefront-temporal'],
      ['id', 'sf_123456789, id:sf_123456789'],
      ['handle', 'weekend-storefront, handle:weekend-storefront'],
      ['title', 'weekend storefront, weekend, storefront'],
    ]
  },
  {
    name: 'products',
    properties: [
      ...base_props,
      ['title', 'string'],
      ['price', 'number'],
      ['isbn', 'string'],
      ['qty', 'number'],
      ['compare_at_price', 'number'],
      ['parent_handle', 'string'],
      ['parent_id', 'string'],
    ],
    search: [
      ['tags', 'tag:genre-action'],
      ['id', 'pr_123456789, id:pr_123456789'],
      ['handle', 'super-mario-2, handle:super-mario-2'],
      ['title', 'super mario 2, super, mario'],
      ['product\'s collections ids', 'collection:col_123456789, col:col_123456789'],
      ['product\'s collections handles', 'collection:switch-games, col:switch-games'],
    ]
  },  
]


export const VQLTable = () => {

  return (
    <div className='flex flex-col gap-5'>
      {
        data.map(
          (it, ix) => (
            <div key={ix}>
              <p children={it.name} className='text-2xl italic font-bold' />
              <p children={'The following properties are directly queryable with $eq, $neq, $like, $lt, $lte, $gt, $gte'}  />
              <Table rows={[['property', 'type'], ...it.properties]} />
              <p children={'The following entities are indexed for search \
                using the $search operator (in object mode), or a string without property ops \
                in string mode, look at the examples'} />
              <Table rows={[['What is indexed', 'how it\'s indexed'], ...it.search]} />
            </div>
          )
        )
      }
    </div>
  )
}
