
/** 
 * @satisfies {import('./types.api.d.ts').DiscountApplicationEnum} 
 */
export const DiscountApplicationEnum = {
  Auto:   { id: 0, name: 'Automatic', name2: 'automatic'},
  Manual: { id: 1, name: 'Manual', name2: 'manual'},
}

/**
 * @satisfies {import('./types.api.d.ts').FilterMetaEnum} 
 */
export const FilterMetaEnum = { 
  any: {
    id: undefined,
    name: undefined,
    op: undefined,
    type: undefined
  },
  p_in_collections: 
  { 
    id: 0, type:'product', 
    op: 'p-in-collections', 
    name: 'Product In Collection'
  },
  p_not_in_collections: { 
    id: 1, type:'product', 
    op: 'p-not-in-collections', 
    name: 'Product not in Collection'
  },
  p_in_products: {
    id: 2, type:'product', 
    op: 'p-in-products', 
    name: 'Product belongs to'
  },
  p_not_in_products: { 
    id: 3, type:'product', 
    op: 'p-not-in-products', 
    name: 'Product does not belong to'
  },
  p_in_tags: { 
    id: 4, type:'product', 
    op: 'p-in-tags', 
    name: 'Product has Tag'
  },
  p_not_in_tags: {
    id: 5, type:'product', 
    op: 'p-not-in-tags', 
    name: 'Product excludes Tag'
  },    
  p_all: {
    id: 6, type:'product', 
    op: 'p-all', name: 'All Products'
  },    
  p_in_price_range: {
    id: 7, type:'product', 
    op: 'p-in-price-range', 
    name: 'Product in Price range'
  },    
  o_subtotal_in_range: {
    id: 100, type:'order', 
    op: 'o-subtotal-in-range', 
    name: 'Order subtotal in range'
  },    
  o_items_count_in_range: {
    id: 101, type:'order', 
    op: 'o-items-count-in-range', 
    name: 'Order items count in range'
  },    
  o_date_in_range: {
    id: 102, type:'order', 
    op: 'o-date-in-range', 
    name: 'Order in dates'
  },    
  o_has_customer: {
    id: 103, type:'order', 
    op: 'o-has-customer', 
    name: 'Order has Customers'
  },    
}

/** 
 * @satisfies {import('./types.api.d.ts').DiscountMetaEnum} 
 */
export const DiscountMetaEnum = {
  any: {
    id: undefined,
    name: undefined
  },
  regular: { 
    id: 0, 
    type: 'regular',          
    name : 'Regular Discount', 
  },
  bulk: { 
    id: 1, type: 'bulk',          
    name : 'Bulk Discount', 
  },
  buy_x_get_y: { 
    id: 2, type: 'buy_x_get_y' ,  
    name : 'Buy X Get Y',
  },
  order: { 
    id: 3, type: 'order', 
    name : 'Order Discount',
  },
  bundle: { 
    id: 4, type: 'bundle', 
    name : 'Bundle Discount',
  },
}

/** 
 * @satisfies {import('./types.api.d.ts').CheckoutStatusEnum} 
 */
export const CheckoutStatusEnum = {
  created: { 
    id: 0, name2: 'created', name: 'Created'
  },
  requires_action: { 
    id: 1, name2: 'requires_action', name: 'Requires Action'
  },
  failed: { 
    id: 2, name2: 'failed', name: 'Failed'
  },
  complete: { 
    id: 3, name2: 'complete', name: 'Complete'
  },
  unknown: { 
    id: 4, name2: 'unknown', name: 'Unknown'
  },
}

/** 
 * @satisfies {import('./types.api.d.ts').FulfillOptionsEnum} 
 */
export const FulfillOptionsEnum = {
  draft: { 
    id: 0, name2: 'draft', name: 'Draft'
  },
  processing: { 
    id: 1, name2: 'processing' ,name: 'Processing (Stock Reserved)'
  },
  shipped: { 
    id: 2, name2: 'shipped' ,name: 'Shipped'
  },
  fulfilled: { 
    id: 3, name2: 'fulfilled', name: 'Fulfilled' 
  },
  cancelled: { 
    id: 4, name2: 'cancelled', name: 'Cancelled (Stock returned)' 
  }
}

/** 
 * @satisfies {import('./types.api.d.ts').PaymentOptionsEnum} 
 */
export const PaymentOptionsEnum = {
  unpaid: { 
    id: 0, name: 'Unpaid', name2: 'unpaid'
  },
  authorized: { 
    id: 1, name: 'Authorized', name2: 'authorized'
  },
  captured: { 
    id: 2, name: 'Captured', name2: 'captured'
  },
  requires_auth: { 
    id: 3, name: 'Requires Authentication', name2: 'requires_auth'
  },
  voided: { 
    id: 4, name: 'Voided', name2: 'voided'
  },
  failed: { 
    id: 5, name: 'Failed', name2: 'failed'
  },
  partially_paid: { 
    id: 6, name: 'Partially paid', name2: 'partially_paid' 
  },
  refunded: { 
    id: 7, name: 'Refunded', name2: 'refunded' 
  },
  partially_refunded: { 
    id: 8, name: 'Partially Refunded', name2: 'partially_refunded' 
  },
  cancelled: { 
    id: 9, name: 'Cancelled', name2: 'cancelled' 
  },
}
