import React, { useMemo } from 'react'
import Table from './table.jsx'
import { parseJsDoc } from './jsdoc-helper.mjs';
import Drawer from './drawer.jsx';
import CodeBlock from './code-block.jsx';
import ShowIf from './show-if.jsx';

const js = `

// products

/** 
 * @typedef {object} ProductData Product scheme
 * @property {string[]} collections handles of collection this product belongs to
 * @property {string} video video media url
 * @property {number} price price
 * @property {string} handle a unique readable identifier
 * @property {string} parent_handle handle of parent product in case this product is a variant
 * @property {VariantOption[]} variants_options variants options info
 * @property {Object.<string, VariantCombination>} variants_products mapping of product variants handles to product data and variants options selection
 * @property {VariantOptionSelection[]} _variant_hint Internal usage, clarifies the variant projected options
 * @property {number} qty integer stock quantity
 * @property {number} compareAtPrice compare at price point
 * @property {Object.<string, DiscountData>} discounts discounts we know were applied to this product
 * @property {AttributeData[]} attributes custom attributes
 * @property {string[]} tags list of tags , example ['genere_action', 'rated_M', ...]
 * @property {number} updatedAt update time millis UTC
 * @property {number} createdAt create time millis UTC
 * @property {string[]} media list of image urls
 * @property {string} title title of collection
 * @property {string[]} search simple search index
 * @property {string} desc description
 * @property {boolean} active The product is active or inactive (It won't be published in a collection)
 */
export const ProductData = {}

/**
 * @typedef {string} Handle a string handle
 * 
 * @typedef {object} VariantOptionSelection A tuple of option id and selected value id
 * @property {string} option_id Variant option id
 * @property {string} value_id Variant selected value id
 * 
 * @typedef {object} VariantCombination A tuple of option id and selected value id
 * @property {VariantOptionSelection[]} selection a list of selection of option and value
 * @property {ProductData} product the product data associated with this variant
 * 
 * @typedef {object} ProductVariantData The associated variants for the product
 * @property {VariantOption[]} options Variant options list
 * @property {Object.<Handle, VariantCombination>} variants Variant options list
 * 
 * @typedef {object} TextEntity A tuple of text and unique ID
 * @property {string} id the id of the entity
 * @property {string} value the text value of the entity
 * 
 * @typedef {object} VariantOption The data of a variant option
 * @property {string} name variant option name (for example 'Size')
 * @property {string} id variant option id
 * @property {TextEntity[]} values variant option values (for example 'Small' / 'Medium' / 'Large' ..)
 */

/**@type {VariantOptionSelection} */
export const VariantOptionSelection = {}

/**@type {VariantCombination} */
export const VariantCombination = {}

/**@type {TextEntity} */
export const TextEntity = {}

/**@type {VariantOption} */
export const VariantOption = {}

/**@type {Handle} */
export const Handle = {}

// collections

/** 
 * @typedef {object} CollectionData Collection of products
 * @property {string} handle unique handle
 * @property {AttributeData[]} attributes custom attributes
 * @property {string[]} tags list of tags , example ['genere_action', 'rated_M', ...]
 * @property {number} updatedAt update time millis UTC
 * @property {number} createdAt create time millis UTC
 * @property {string[]} media list of image urls
 * @property {string} title title of collection
 * @property {string[]} search simple search index
 * @property {string} desc description
 * @property {boolean} active description
 * @property {string} _published published json url
 * 
 */
export const CollectionData = {}


/** 
 * @typedef {object} CollectionExportedData Exported collection of products
 * @property {string} handle unique handle
 * @property {ProductData[]} products products in collection
 * @property {AttributeData[]} attributes custom attributes
 * @property {string[]} tags list of tags , example ['genere_action', 'rated_M', ...]
 * @property {number} updatedAt update time millis UTC
 * @property {number} createdAt create time millis UTC
 * @property {string[]} media list of image urls
 * @property {string} title title of collection
 * @property {string[]} search simple search index
 * @property {string} desc description
 * 
 */
export const CollectionExportedData = {}

// store-front

/** 
 * @typedef {object} StorefrontData Storefront scheme
 * @property {string} handle unique handle
 * @property {string[]} collections list of collections handles
 * @property {string[]} discounts list of discount codes
 * @property {string[]} products list of products handles
 * @property {string[]} posts list of posts handles
 * @property {string[]} shipping_methods list of shipping methods handles
 * @property {string} video video url
 * @property {string} _published exported storefront url
 * @property {AttributeData[]} attributes custom attributes
 * @property {string[]} tags list of tags , example ['genere_action', 'rated_M', ...]
 * @property {number} updatedAt update time millis UTC
 * @property {number} createdAt create time millis UTC
 * @property {string[]} media list of image urls
 * @property {string} title title of collection
 * @property {string[]} search simple search index
 * @property {string} desc description
 */
export const StorefrontData = {}

/** 
 * @typedef {object} StorefrontExportData Exported Storefront scheme
 * @property {string} handle unique handle
 * @property {CollectionData[]} collections list of collections
 * @property {DiscountData[]} discounts list of discount
 * @property {ProductData[]} products list of products 
 * @property {PostData[]} posts list of posts 
 * @property {ShippingData[]} shipping_methods list of shipping methods
 * @property {string} video video url
 * @property {AttributeData[]} attributes custom attributes
 * @property {string[]} tags list of tags , example ['genere_action', 'rated_M', ...]
 * @property {number} updatedAt update time millis UTC
 * @property {number} createdAt create time millis UTC
 * @property {string[]} media list of image urls
 * @property {string} title title of collection
 * @property {string[]} search simple search index
 * @property {string} desc description
 */
export const StorefrontExportData = {}


// discounts

/** 
 * @typedef {object} DiscountData Discount scheme
 * @property {object} info details and filters of the discount
 * @property {DiscountDetails} info.details discount details
 * @property {Filter[]} info.filters list of discount filter
 * @property {DiscountApplication} application discount application (automatic and coupons)
 * @property {string} code a unique readable discount code
 * @property {boolean} enabled is the discount enabled
 * @property {number} order the order in which to apply the discounts stack (priority)
 * @property {string} _published the collection handle that contains the applicable discount products
 * @property {AttributeData[]} attributes custom attributes
 * @property {string[]} tags list of tags , example ['genere_action', 'rated_M', ...]
 * @property {number} updatedAt update time millis UTC
 * @property {number} createdAt create time millis UTC
 * @property {string[]} media list of image urls
 * @property {string} title title
 * @property {string[]} search simple search index
 * @property {string} desc description
 */
export const DiscountData = {}

/** 
 * @typedef {object} DiscountApplication Discounts can be manual(coupon) or automatic types, see <a href='#DiscountApplicationEnum'>#DiscountApplicationEnum</a> 
 * @property {number} id 0 = Automatic, 1 = Manual
 * @property {'Automatic' | 'Manual'} name printable name
 * @property {'automatic' | 'manual'} name2 id name
 * 
 */
export const DiscountApplication = {}

/** 
 * 
 * @typedef {object} Filter Discount filter scheme
 * @property {FilterMeta} meta meta data related to identifying the filter
 * @property {string[] | object} value the filter params
 * @property {number=} value.from
 * @property {number} value.to
 * 
 */
export const Filter = {}

/**
 * @typedef {object} FilterMeta Filter meta data, see <a href='#FilterMetaEnum'>#FilterMetaEnum</a> 
 * @property {number} id unique identifier for filter type
 * @property {'product' | 'order'} type product or order filter
 * @property {'p-in-collections' | 'p-not-in-collections' | 'p-in-handles' | 'p-not-in-handles' | 'p-in-tags' | 'p-not-in-tags' | 'p-all' | 'p_in_price_range' | 'o-subtotal-in-range' | 'o-items-count-in-range' | 'o-date-in-range' | 'o_has_customer'} op operation name id
 * @property {string} name printable name
 * 
 */
export const FilterMeta = {}

/** 
 * @typedef {object} DiscountDetails The details of how to apply a discount. The type of discount and it's params
 * @property {DiscountMeta} meta metadata to identify the type of discount
 * @property {RegularDiscountExtra|OrderDiscountExtra|BulkDiscountExtra|BuyXGetYDiscountExtra|BundleDiscountExtra} extra extra parameters of the specific discount type
 */
export const DiscountDetails = {}


/** 
 * @typedef {object} DiscountMeta Discount meta data, see <a href='#DiscountMetaEnum'>#DiscountMetaEnum</a> 
 * @property {0 | 1 | 2 | 3} id unique identifier of discount type (bulk, regular, order)
 * @property {'regular' | 'bulk' | 'buy_x_get_y' | 'order' | 'bundle'} type textual identifier
 * @property {string} name printable name
 * 
 */
export const DiscountMeta = {}

/** 
 * @typedef {object} RegularDiscountExtra Parameters of a regular discount
 * @property {number} fixed fixed price addition
 * @property {number} percent percents off
 */
export const RegularDiscountExtra = {}

/** 
 * @typedef {object} OrderDiscountExtra Parameters of order discount
 * @property {number} fixed fixed price addition
 * @property {number} percent percents off
 * @property {boolean} free_shipping do we have free shipping ?
 */
export const OrderDiscountExtra = {}

/** 
 * @typedef {object} BulkDiscountExtra Parameters of bulk discount
 * @property {number} fixed fixed price addition
 * @property {number} percent percents off
 * @property {number} qty the integer quantity for which the discount is given
 * @property {boolean} recursive apply the discount as many times as possible
 */
export const BulkDiscountExtra = {}

/** 
 * @typedef {object} BuyXGetYDiscountExtra Parameters of bulk discount
 * @property {number} fixed fixed price addition for the given Y products
 * @property {number} percent percents off for the given Y products
 * @property {number} qty_x the integer quantity of BUY X
 * @property {number} qty_y the integer quantity of BUY Y
 * @property {Filter[]} filters_y The filters for what a customer gets (Y)
 * @property {boolean} [recursive] apply the discount as many times as possible
 */
export const BuyXGetYDiscountExtra = {}

/** 
 * @typedef {object} BundleDiscountExtra Parameters of bulk discount
 * @property {number} fixed fixed price addition for the given Y products
 * @property {number} percent percents off for the given Y products
 * @property {boolean} [recursive] apply the discount as many times as possible
 */
export const BundleDiscountExtra = {}


/** 
 * @enum {DiscountApplication} 
 */
export const DiscountApplicationEnum = {
  Auto:   { id: 0, name: 'Automatic', name2: 'automatic'},
  Manual: { id: 1, name: 'Manual', name2: 'manual'},
}

/**
 * @enum {FilterMeta} 
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
 * @enum {DiscountMeta} 
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


// images

/** 
 * @typedef {object} ImageData Image scheme
 * @property {string} provider storage provider
 * @property {string} handle unique handle
 * @property {string} name name
 * @property {string} url it's published public url
 * @property {string} ref it's api resource location
 * @property {string[]} usage which collections referenced this image
 * @property {string[]} search simple searcg index
 * @property {number} updatedAt update time millis UTC
 */
export const ImageData = {}

/**
 * @typedef {object} AttributeData Attributes are key-value strings, that you can attach to almost any document. They allow you to customize things
 * @property {string} key key
 * @property {string} val value
 */
/**@type {AttributeData} */
export const AttributeData = {}

// tags

/** 
 * @typedef {object} TagData A Tag is composed of a key and many values. This is helpful for creating client side filtering
 * @property {string[]} values list of values
 * @property {string} name the key
 * @property {string} desc rich description
 * @property {string[]} search simple search index
 * @property {number} createdAt create time millis UTC
 * @property {number} updatedAt update time millis UTC
 */
export const TagData = {}

// users

/** 
 * @typedef {object} Address Addresses are used in customer info and orders
 * @property {string} firstname first name of recipient
 * @property {string} lastname last name of recipient
 * @property {string} company optional company name of recipient
 * @property {string} street1 street address 1
 * @property {string} street2 street address 2
 * @property {string} city city
 * @property {string} country country
 * @property {string} state state
 * @property {string} zip_code zip code
 * @property {string} postal_code postal code
 * @property {string} phone_number phone number
 */
export const Address = {}

/** 
 * @typedef {object} UserData Customer info
 * @property {string} firstname first name
 * @property {string} lastname last name
 * @property {string} email email address
 * @property {string} phone_number phone number
 * @property {Address} address address info
 * @property {string} uid firebase authentication user id
 * @property {string[]} tags list of tags , example ['likes_games', 'subscribed_false', ...]
 * @property {string[]} search simple search index
 * @property {number} createdAt create time millis UTC
 * @property {number} updatedAt update time millis UTC
 */
export const UserData = {}


// orders

/** 
 * 
 * @typedef {object} OrderData Order scheme.
 * @property {string} id unique order id
 * @property {object} status status of checkout, fulfillment and payment
 * @property {CheckoutStatusOptions} status.checkout checkout status
 * @property {PaymentOptions} status.payment payment status
 * @property {FulfillOptions} status.fulfillment fulfillment status
 * @property {object} contact buyer info
 * @property {string} contact.phone_number buyer's phone number
 * @property {string} contact.email buyer's email
 * @property {string} contact.uid buyer's firebase authentication user id (optional)
 * @property {Address} address shipping address info
 * @property {LineItem[]} line_items line items is a list of the purchased products
 * @property {string} notes notes for the order
 * @property {ShippingData} delivery shipping method info
 * @property {DiscountData[]} coupons a list of manual coupons
 * @property {PricingData} pricing pricing information
 * @property {ValidationEntry[]} [validation] in case the order went through validation 
 * @property {OrderPaymentGatewayData} payment_gateway payment gateway info and status
 * @property {AttributeData[]} attributes custom attributes
 * @property {string[]} tags list of tags , example ['genere_action', 'rated_M', ...]
 * @property {number} updatedAt update time millis UTC
 * @property {number} createdAt create time millis UTC
 * @property {string[]} search simple search index
 */
export const OrderData = {}


/** 
 * @typedef {object} FulfillOptions Fulfillment options encapsulate the current state, see <a href='#FulfillOptionsEnum'>#FulfillOptionsEnum</a> 
 * @property {number} id 0-draft, 1-processing, 2-shipped, 3-fulfilled, 4-cancelled
 * @property {string} name readable/printable name
 * @property {'draft' | 'processing' | 'shipped' | 'fulfilled' | 'cancelled'} name2 unique name (like id)
 */
export const FulfillOptions = {}

/** 
 * @typedef {object} PaymentOptions Payment options encapsulate the current state, see <a href='#PaymentOptionsEnum'>#PaymentOptionsEnum</a> 
 * @property {number} id 0-unpaid, 1-captured, 2-requires_auth, 3-requires_auth, 4-voided, 5-failed, 6-partially_paid, 7-refunded
 * @property {string} name readable/printable name
 * @property {'unpaid' | 'authorized' | 'captured' | 'requires_auth' | 'voided' | 'partially_paid' | 'refunded' | 'partially_refunded'} name2 unique name (like id)
 */
export const PaymentOptions = {}

/** 
 * @typedef {object} CheckoutStatusOptions Checkout status encapsulate the current state, see <a href='#CheckoutStatusEnum'>#CheckoutStatusEnum</a> 
 * @property {number} id 0-created, 1-requires_action, 2-failed, 3-complete
 * @property {string} name readable/printable name
 * @property {'created' | 'requires_action' | 'failed' | 'complete'} name2 unique name (like id)
 */

/** 
 * @enum {CheckoutStatusOptions} 
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
}

/** 
 * @enum {FulfillOptions} 
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
 * @enum {PaymentOptions} 
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
}

/** 
 * @typedef {object} PricingData Pricing object exaplins how the pricing of an order was calculated given a stack of automatic discounts, coupons, line items and shipping method
 * @property {EvoEntry[]} evo explanation of how discounts stack and change pricing
 * @property {ShippingData} shipping_method selected shipping method
 * @property {number} subtotal_undiscounted subtotal of items price before discounts
 * @property {number} subtotal_discount sum of all discounts at all stages
 * @property {number} subtotal subtotal_undiscounted - subtotal_discount
 * @property {number} total subtotal + shipping
 * @property {number} total_quantity how many items were discounted
 * @property {string} uid firebase authentication user id
 * @property {DiscountError[]} errors
 */
export const PricingData = {}


/** 
 * @typedef {object} LineItem A line item is a product, that appeared in an order
 * @property {string} id id or handle of product
 * @property {number} price it's known price
 * @property {number} qty integer quantity of how many such products were bought
 * @property {number} stock_reserved used by order to indicate it has reserved stock and it's amount
 * @property {ProductData} data (optional) the product data
 **/ 
export const LineItem = {}

/**
 * @typedef {object} EvoEntry Explain how a specific discount was used to discount line items
 * @property {DiscountData} discount discount data
 * @property {string} discount_code the discount code
 * @property {number} total_discount the amount of money that was discounted by this discount
 * @property {number} quantity_undiscounted how many items are left to discount
 * @property {number} quantity_discounted how many items were discounted now
 * @property {number} subtotal running subtotal without shipping
 * @property {number} total running total
 * @property {LineItem[]} line_items available line items after discount
 * 
 * @typedef {object} DiscountError
 * @property {string} discount_code
 * @property {string} message
 */ 
export const EvoEntry = {}

/**
 * @typedef {object} ValidationEntry checkouts or draft orders might be validated in automatic systems
 * @property {string} id
 * @property {string} title
 * @property {'out-of-stock' | 'not-enough-stock' | 'some-stock-is-on-hold'} message
 */ 

/**@type {ValidationEntry} */
export const ValidationEntry = {}

/**
 * @typedef {object} OrderPaymentGatewayData How did the order interacted with a payment gateway ? 
 * @property {string} gateway_id the payment gateway identifier
 * @property {object} on_checkout_create result of gateway at checkout creation
 * @property {object} on_checkout_complete result of gateway at checkout completion
 * @property {object} latest_status latest status of payment
 */
/**@type {OrderPaymentGatewayData} */
export const OrderPaymentGateway = {}



// posts

/** 
 * @typedef {object} PostData Post data is a rich text and media resource. Can be used for writing blog posts with markdown and html
 * @property {string} handle unique handle
 * @property {string[]} tags list of tags , example ['genere_action', 'rated_M', ...]
 * @property {number} updatedAt update time millis UTC
 * @property {number} createdAt create time millis UTC
 * @property {string[]} media list of image urls
 * @property {string} title title of collection
 * @property {string[]} search simple search index
 * @property {string} text rich text
 */
export const PostData = {}


// shipping methods

/** 
 * @typedef {object} ShippingData Shipping method info is used to describe the shipping options you offer
 * @property {string} id unique identifier
 * @property {number} price the price of the shipping method
 * @property {string} name name or title of the method
 * @property {string} desc description of the method
 * @property {AttributeData[]} attributes custom attributes
 * @property {string[]} tags list of tags , example ['genere_action', 'rated_M', ...]
 * @property {number} updatedAt update time millis UTC
 * @property {number} createdAt create time millis UTC
 * @property {string[]} media list of image urls
 * @property {string[]} search simple search index
 * @property {boolean} active is the shipping method active ?
 */
export const ShippingData = {}

// payment gateway config

/** 
 * @typedef {object} PaymentGatewayData Payment gateway configs which you can load at backend to define keys, secrets and specific behaviours
 * @property {string} title title of the gateway
 * @property {number} id it's identifier
 * @property {number} gateway_id same as id
 * @property {number} updatedAt update time millis UTC
 * @property {number} createdAt create time millis UTC
 * @property {AttributeData[]} attributes custom attributes
 */
export const PaymentGatewayData = {}

// main settings

/**
 * @enum {StorageType}
 */
export const StorageTypeEnum = {
  google_cloud_storage: 'google_cloud_storage',
  cloudflare_r2: 'cloudflare_r2',
  aws_s3: 'aws_s3',
  compatible_s3: 'compatible_s3',
}

/**
 * @typedef {'google_cloud_storage' | 'cloudflare_r2' | 'aws_s3' | 'compatible_s3'} StorageType internal id of provider
 * 
 * @typedef {object} StorageSettings
 * @property {Object.<string, FirebaseStorageSettings | S3CompatibleStorageSettings>} items storage configurations
 * @property {StorageType} selected selected configuration for uploads
 * 
 * @typedef {object} FirebaseStorageSettings
 * @property {string} custom_domain Use a CDN domain/subdomain to rewrite the presented files 
 * 
 * @typedef {object} S3CompatibleStorageSettings
 * @property {string} bucket The bucket name of the storage
 * @property {string} access_key The access key
 * @property {string} secret The secret
 * @property {string} [endpoint] The S3 Endpoint
 * @property {boolean} force_path_style Whether to force path style URLs for S3 objects (e.g., https://s3.amazonaws.com/<bucketName>/<key> instead of https://<bucketName>.s3.amazonaws.com/<key>
 * @property {string} custom_domain Use a CDN domain/subdomain to rewrite the presented files 
 * 
 * @typedef {object} BackendSettings
 * @property {string} url permanant url of shelf app at backend
 * @property {string} apiKey api key security. Will be sent with every request to backend
 * @property {string} secret (soon) a secret that will be used to sign requests for improved
 * 
 * @typedef {object} SettingsData Shelf's settings
 * @property {BackendSettings} backend backend settings
 * @property {StorageSettings} storage storage settings
 * @property {number} updatedAt update time millis UTC
 * @property {number} createdAt create time millis UTC
 * @property {AttributeData[]} attributes custom attributes
 */
export const SettingsData = {}

/**@type {CloudflareR2Settings} */
export const CloudflareR2Settings = {}
/**@type {S3CompatibleStorageSettings} */
export const S3CompatibleStorageSettings = {}
/**@type {StorageSettings} */
export const StorageSettings = {}
/**@type {FirebaseStorageSettings} */
export const FirebaseStorageSettings = {}

// notifications
/**
 * @typedef {object} NotificationData Notications are used to describe admin notifications, you can write these documents from backend to deliver notifications about your business
 * @property {number} updatedAt update time millis UTC
 * @property {string} message message of notification, can be markdown, markup or plain text
 * @property {string[]} search (required) search index 
 * @property {string} [author] author of the notification
 * @property {NotificationAction[]} actions list of actions
 */
export const NotificationData = {}
/**@type {NotificationActionType} */

/**
 * @typedef {object} NotificationAction each notification may have an actionable item associated with it. For example, clicking an order notification will route to the order page at Shelf
 * @property {string} name name of the action
 * @property {NotificationActionType} type the type of action
 * @property {NotificationActionRouteParams | NotificationActionUrlParams} params extra params for the actions type
 * 
 */

/**@type {NotificationAction} */
export const NotificationAction = {}

/**
 * @typedef {'route' | 'url'} NotificationActionType 'route' means routing inside shelfm 'url' is linking to a url
 */
/**@type {NotificationData} */
export const NotificationActionType = {}


/**
 * @typedef {object} NotificationActionRouteParams route inside shelf action params
 * @property {string} collection which collection
 * @property {string} document which document
 */ 
/**@type {NotificationActionRouteParams} */
export const NotificationActionRouteParams = {}

/** 
 * @typedef {object} NotificationActionUrlParams Action params for actions of type 'url'
 * @property {boolean} new_window open the url in new window
 * @property {string} url the url to open
 */
/**@type {NotificationActionUrlParams} */
export const NotificationActionUrlParams = {}

// stats

/** 
 * @typedef {object} MovingStatsProduct
 * @property {string} handle product handle
 * @property {string} title product title
 * @property {number} val count of product
 */
export const MovingStatsProduct = {}

/**
 * @typedef {object} MovingStatsDay
 * @property {number} total total income in day
 * @property {number} orders total orders in day
 * @property {number} orders total orders in day
 * @property {number} day start of day in UTC millis
 * @property {Object.<string, number>} discounts a map between discount code to count
 * @property {Object.<string, number>} collections a map between collection handle to count
 * @property {Object.<string, number>} tags a map between tag name to count
 * @property {Object.<string, MovingStatsProduct>} products a map between product handle to product stat data
 */ 
export const MovingStatsDay = {}

/** 
 * @typedef {object} MovingStatsInfo
 * @property {number} maxOrderTime latest order time, that was recorded (used for optimization)
 * @property {Object.<number, MovingStatsDay>} days map start of days to stats
 */
export const MovingStatsInfo = {}


/** 
 * @typedef {object} MovingStatsData
 * @property {MovingStatsInfo} info
 * @property {number} fromDay from start of day (millis)
 * @property {number} toDay to an end of day (millis)
 * @property {number} updatedAt when updated (millis)
 */
export const MovingStatsData = {}

/** 
 * @typedef {object} CartData A client cart, used for line items
 * @property {string} id
 * @property {number} createdAt
 * @property {LineItem[]} line_items
 */
export const CartData = {}

/**
 * @typedef {object} ShelfAdminConfig
 * @property {string} apiKey
 * @property {string} projectId
 * @property {string} storageBucket
 * @property {string} backend
 */

// backend

/**
 * @typedef {object} BackendPaymentGatewayStatus
 * @property {string[]} messages array of message, support markdown, html and plain text
 */
/**@type {BackendPaymentGatewayStatus} */
export const BackendPaymentGatewayStatus = {}


`

const enum_DiscountApplication = `
/** 
 * @enum {DiscountApplication} 
 */
export const DiscountApplicationEnum = {
  Auto:   { id: 0, name: 'Automatic'},
  Manual: { id: 1, name: 'Manual'},
}
`

const enum_FilterMeta = `
/**
 * @enum {FilterMeta} 
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
`

const enum_DiscountMeta = `
/** 
 * @enum {DiscountMeta} 
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
`

const enum_CheckoutStatusEnum = `
/** 
 * @enum {CheckoutStatusOptions} 
 */
export const CheckoutStatusEnum = {
  created: { 
    id: 0, name: 'created'
  },
  requires_action: { 
    id: 1, name: 'requires_action'
  },
  failed: { 
    id: 2, name: 'failed'
  },
  complete: { 
    id: 3, name: 'complete'
  },
}
`

const enum_FulfillOptions = `
/** 
 * @enum {FulfillOptions} 
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
`


const enum_PaymentOptions = `
/** 
 * @enum {PaymentOptions} 
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
    id: 3, name: 'Requires Authentication', name2: 'requires authentication'
  },
  voided: { 
    id: 4, name: 'Voided', name2: 'voided'
  },
  failed: { 
    id: 5, name: 'Failed', name2: 'failed'
  },
  partially_paid: { 
    id: 6, name: 'Partially paid', name2: 'partially paid' 
  },
  refunded: { 
    id: 7, name: 'Refunded', name2: 'refunded' 
  },
  partially_refunded: { 
    id: 8, name: 'Partially Refunded', name2: 'partially refunded' 
  },
}
`

const blocks_ = parseJsDoc(js)

/**
 * 
 * @param {string} type 
 * @param {import('./jsdoc-helper.mjs').JsDocBlock[]} blocks
 */
const type2Href = (type, blocks) => {
  const filter = [
    'string',
    'number',
    'boolean',
    'object',
    'Object',
    'Map',
  ]

  const isit = p => {
    return blocks.some(b => b.name===p)
          // p.search(/(\w+)/g)>=0 && 
          // !filter.includes(p) &&
          // p.toLowerCase()!==p
  }

  const ps = type?.split(
    /(\w+|\W+)/g
    ).filter(
      a=>a!==''
    ).map(
      p => {
        if(isit(p))
          return (
            <a href={`#${p}`} children={p} className={'underline decoration-2 inline'} />
            )
        else return (
          <span children={p}/>
          )
      }
  )

  return (
    <div children={ps} 
         className='bg-pink-50 dark:bg-pink-50/10 p-1 rounded-md w-fit' />
  )
}

const Title = ({name}) => {

  return (
  <a href={`#${name}`} name={name} 
     children={
      <div className='w-full py-px overflow-x-auto overflow-y-hidden'>
        <span children='#' className=''/> 
        <span children={name} 
        className='--underline  font-light text-kf-500 p-1 
                 bg-kf-500/5 rounded-lg dark:text-pink-400 
                  dark:bg-pink-400/10 ' /> 
      </div>
     } 
     className='text-xl 
                tracking-widest font-light w-full' />    
  )
}

const Enum = ({ title, children, ...rest }) => {
  return (
<div {...rest} >
  <div className='flex flex-col gap-5'>
    <Title name={title} />
    <CodeBlock cclassName='lang=js' children={children} />
  </div>
</div>
  )
}

/**
 * 
 * @param {object} param0 
 * @param {import('./jsdoc-helper.mjs').JsDocBlock} param0.block
 * @param {import('./jsdoc-helper.mjs').JsDocBlock[]} param0.blocks
 * @returns 
 */
export const JsDocTable = ({ block, blocks }) => {
  const rows = useMemo(
    () => {
      return [
        ['property', 'type', 'description'],
        ...block?.properties.map(
          b => ([b.name, type2Href(b.type, blocks), b.desc])
        )
      ]
    }, [block, type2Href]
  )

  // console.log(rows)
  if(rows.length==0) {
    console.log('block')
    // console.log(block)
    return null
  }  
  // return null
return (
<div>
  <Title name={block.name} />
  {
    block.desc &&
    <p className='text-lg'
       dangerouslySetInnerHTML={ {
        __html: block.desc
       }} />
  }           
  <ShowIf show={rows.length>1} >
    <Table rows={rows} className='w-full mt-3' />
  </ShowIf>       
  <Drawer className='--p-5 bg-kf-50 dark:bg-kf-50/10 rounded-md'
        button={<p children='> jsDocs Defintions' className='p-3 text-base'/>}
        >
    <CodeBlock children={block.jsdoclines} className='lang=jsdoc' />
  </Drawer>
  {
    block.name==='DiscountApplication' &&
    <Enum className='mt-10' title='DiscountApplicationEnum' children={enum_DiscountApplication} />
  }
  {
    block.name==='DiscountMeta' &&
    <Enum className='mt-10' title='DiscountMetaEnum' children={enum_DiscountMeta} />
  }
  {
    block.name==='FilterMeta' &&
    <Enum className='mt-10' title='FilterMetaEnum' children={enum_FilterMeta} />
  }
  {
    block.name==='FulfillOptions' &&
    <Enum className='mt-10' title='FulfillOptionsEnum' children={enum_FulfillOptions} />
  }
  {
    block.name==='PaymentOptions' &&
    <Enum className='mt-10' title='PaymentOptionsEnum' children={enum_PaymentOptions} />
  }
  {
    block.name==='CheckoutStatusOptions' &&
    <Enum className='mt-10' title='CheckoutStatusOptionsEnum' children={enum_CheckoutStatusEnum} />
  }
</div>
  )
}

/**
 * 
 * @param {object} param0 
 * @param {import('./jsdoc-helper.mjs').JsDocBlock[]} param0.block
 * @returns 
 */
export const JsDocTables = ({ blocks=blocks_ }) => {
  
return (
  <div className='flex flex-col gap-10 pr-0 md:pr-10'>
  {
    blocks.map(
      b => (
        <JsDocTable block={b} blocks={blocks} />
      )
    )
  }
  </div>
  )
}
