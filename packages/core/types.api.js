

/** 
 * @enum {import('./types.api').DiscountApplication} 
 */
export const DiscountApplicationEnum = {
  Auto:   { id: 0, name: 'Automatic', name2: 'automatic'},
  Manual: { id: 1, name: 'Manual', name2: 'manual'},
}

/**
 * @enum {import('./types.api').FilterMeta} 
 */
export const FilterMetaEnum = { 
  p_in_collections: { 
    id: 0, type:'product', 
    op: 'p-in-collections', 
    name: 'Product In Collection'
  },
  p_not_in_collections: { 
    id: 1, type:'product', 
    op: 'p-not-in-collections', 
    name: 'Product not in Collection'
  },
  p_in_handles: {
    id: 2, type:'product', 
    op: 'p-in-handles', 
    name: 'Product has ID'
  },
  p_not_in_handles: { 
    id: 3, type:'product', 
    op: 'p-not-in-handles', 
    name: 'Product excludes ID'
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
    op: 'p_in_price_range', 
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
 * @enum {import('./types.api').DiscountMeta} 
 */
export const DiscountMetaEnum = {
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

