
export type error_item = {
  message?: string,
  code?: string,
  expected?: string,
  received?: string,
  path?: string[]
}

export type error = {
  messages?: error_item[]
}

export type Handle = string;
export type ID = string;

/**
 * @description Timestamps
 */
export type timestamps = {
  /**
   * @description ISO string creation time
   */
  created_at?: string;

  /**
   * @description ISO string update time
   */
  updated_at?: string;
}

/**
 * @description searchable
 */
export type searchable = {
  /** Search terms, usually computed by backend */
  search?: string[];
}

/**
 * @description with `id`
 */
export type idable = {
  /** 
   * @description ID 
   */
  id?: string;
}

/** 
 * @description Base properties 
 */
export interface BaseType extends idable, timestamps {
  /** 
   * @description List of images urls 
   */
  media?: string[];

  /** 
   * @description List of attributes 
   */
  attributes?: AttributeType[];

  /** 
   * @description List of tags , example ['genere_action', 'rated_M', ...] 
   */
  tags?: string[];

  /** 
   * @description Rich description 
   */
  description?: string;

  /** 
   * @description Is the entity active ? 
   */
  active?: boolean;
}


// auth

/**
 * @description JSON Web Token claims
 */
interface JWTClaims {
  iss: string;
  sub: string;
  aud: string;
  exp: number;
  nbf: number;
  iat: number;
  jti: string;
  /**
   * @description User roles and authorizations
   */
  roles: string[]
}

/**
 * @description Auth base type
 */
export type AuthBaseType = {
  /**
   * @description Email of user
   * @format email
   */
  email: string;

  /**
   * Upon `upsert` only the hash will be saved
   * 
   * @description password
   * @minLength 4
   * @maxLength 20   
   */
  password: string;
}

/**
 * @description Role of authenticated user
 */
export type Role = 'admin' | 'user' | string;

/**
 * @description Sign in type
 */
export type ApiAuthSigninType = AuthBaseType;

/**
 * @description Sign up type
 */
export type ApiAuthSignupType = AuthBaseType;

/**
 * @description Refresh token input type
 */
export type ApiAuthRefreshType = {
  /**
   * @description A refresh token
   */
  refresh_token: string;
}

/**
 * @description API token with parsed claims
 */
export type ApiTokenWithClaims = {
  /**
   * @description a token (`access` or `refresh`)
   */
  token: string;

  /**
   * @description Claims the `JSON Web Token` holds
   */
  claims: Partial<JWTClaims>;
}

/**
 * @description Result of `auth` `apikey` creation
 */
export type ApiKeyResult = {
  /**
   * @description The `apikey` is `base64_uri(apikey@storecraft.api:{password})`.
   * It will be shown only once to the user, at the `backend`, the password hash
   * will be saved, thus, the real password is only known to the user.
   */
  apikey: string;
}

/**
 * @description Result of `auth` request
 */
export type ApiAuthResult = {
  /**
   * @description The type of token, should be `bearer` or `refresh`
   */
  token_type: string;

  /**
   * @description the `ID` of user, example `au_....`
   */
  user_id: string;

  /**
   * @description The access token
   */
  access_token: ApiTokenWithClaims;

  /**
   * @description The refresh token
   */
  refresh_token: ApiTokenWithClaims;
}

/**
 * @description Auth user type
 */
export type AuthUserType = BaseType & AuthBaseType & {
  /**
   * @description Is the email confirmed ?
   */
  confirmed_mail?: boolean

  /**
   * @description list of roles and authorizations of the user
   */
  roles?: Role[];
}

// attributes

/**
 * @description Attribute type, a key/value storage
 */
export type AttributeType = {
  /**
   * @description The key
   */
  key: string;

  /**
   * @description The value
   */
  value?: string;
}


// tag type

/**
 * @description Tag type
 */
export interface TagType extends idable, timestamps {
  /** 
   * @description The key name 
   */
  handle: string;

  /** 
   * @description List of values, related to the key
   */
  values: string[];
}

/**
 * @description Tag upsert type
 */
export type TagTypeUpsert = TagType;
  
// collections

/**
 * @description Collection type
 */
export interface CollectionType extends BaseType {
  /** 
   * @description The handle of the entity
   */
  handle: string;

  /** 
   * @description Title of collection 
   * @minLength 3 Title should be longer than 3
   */
  title: string;

  /** 
   * @description Is the entity active ?
   */
  active: boolean;

  /** 
   * @description Collections can be exported into 
   * json with products, this is the url
   */
  published?: string;
}

/**
 * @description Collection upsert type
 */
export type CollectionTypeUpsert = CollectionType;


// products

/** 
 * @description A tuple of option id and selected value id 
 */
export type VariantCombination = {
  /** 
   * @description A list of selection of option and value 
   */
  selection: VariantOptionSelection[];

  /** 
   * @description The product data associated with this variant 
   */
  product: ProductType;
}

/** 
 * @description The data of a variant option 
 */
export type VariantOption = {
  /** 
   * @description Variant option name (for example 'Size') 
   */
  name: string;

  /** 
   * @description Variant option id 
   */
  id: string;

  /** 
   * @description Variant option values 
   * (for example `Small` / `Medium` / `Large` ..) 
   */
  values: TextEntity[];
}

/**
 * @description Identifiable text entity type
 */
export type TextEntity = {
  /** 
   * @description The `id` of the entity 
   */
  id: string;

  /** 
   * @description The text value of the entity 
   */
  value: string;
}

/**
 * @description Variant option selection type
 */
export type VariantOptionSelection = {
  /** 
   * @description Variant option id 
   */
  option_id: string;

  /** 
   * @description Variant selected value id 
   */
  value_id: string;
}

/**
 * @description Variant type
 */
export interface VariantType extends BaseProductType {
  /** 
   * @description Handle of parent product in case this 
   * product is a variant 
   */
  parent_handle: string;

  /** 
   * @description `id` of parent product in case this 
   * product is a variant 
   */
  parent_id: string;

  /** 
   * @description Internal usage, clarifies the variant 
   * projected options 
   */
  variant_hint: VariantOptionSelection[];

  /** 
   * @description List of related products to add the product into, 
   * this is an explicit connection, to form a better UX experience 
   */
  related_products?: BaseProductType[];
  
}

/**
 * @description Base product type
 */
export interface BaseProductType extends BaseType {
  /** 
   * @description The readable unique product `handle`
   */
  handle?: string;

  /** 
   * @description The International Standard Book Number (`ISBN`)
   */
  isbn?: string;

  /** 
   * @description Title of the product 
   * @minLength 3 Title should be longer than 3
   */
  title: string;

  /** 
   * @description Is the product active ? 
   */
  active: boolean;

  /** 
   * @description Video media url 
   */
  video?: string;

  /** 
   * @description Price of the product
   * @minimum 0
   */
  price: number;

  /** 
   * @description Integer stock quantity of product
   * @minimum 0
   */
  qty: number;

  /** 
   * @description Compare at price point 
   * @minimum 0
   */
  compare_at_price?: number;

  /** 
   * @description Collections this product belongs to, expanded field 
   */
  collections?: CollectionType[];

  /** 
   * @description Discounts we know were applied to this product, 
   * expanded type 
   */
  discounts?: DiscountType[];
}

/**
 * @description Variant upsert type
 */
export type VariantTypeUpsert = Omit<VariantType, 
'collections' | 'published' | 'discounts' | 'related_products'> & {
  /** 
   * @description List of collections to add the product into, 
   * this is an explicit connection, to form a better UX experience 
   */
  collections?: Pick<CollectionType, 'id' | 'handle'>[];

  /** 
   * @description List of related products to add the product into, 
   * this is an explicit connection, to form a better UX experience 
   */
  related_products?: Pick<BaseProductType, 'id' | 'handle'>[];
}


/**
 * @description Product type
 */
export interface ProductType extends BaseProductType {
  /** 
   * @description Product variants, expanded type 
   */
  variants?: VariantType[];

  /** 
   * @description Variants options info 
   */
  variants_options?: VariantOption[];

  /** 
   * @description List of related products to add the product into, 
   * this is an explicit connection, to form a better UX experience 
   */
  related_products?: BaseProductType[];
  
}


/**
 * @description Product upsert type
 */
export type ProductTypeUpsert = Omit<ProductType, 
  'collections' | 'published' | 'related_products' | 'discounts' | 'variants'> & {
  /** 
   * @description List of collections to add the product into, 
   * this is an explicit connection, to form a better UX experience 
   */
  collections?: Pick<CollectionType, 'id' | 'handle'>[];

  /** 
   * @description List of related products to add the product into, 
   * this is an explicit connection, to form a better UX experience 
   */
  related_products?: Pick<BaseProductType, 'id' | 'handle'>[];
}



// discounts

/**
 * @description Discount type
 */
export interface DiscountType extends BaseType {
  /**
   * @description Is the discount active ?
   */
  active: boolean;

  /** 
   * @description Title of discount 
   * @minLength 3 Title should be longer than 3
   */
  title: string;

  /** 
   * @description Discount `code` / `handle` 
   */
  handle: string;

  /** 
   * @description The order in which to apply the discounts 
   * stack (priority) 
   * @min 0
   */
  priority: number;

  /** 
   * @description Discounts may generate collections, this 
   * is the collection handle that contains the applicable 
   * discount products 
   */
  published?: string;

  /** 
   * @description Details and filters of the discount 
   */
  info: DiscountInfo;

  /** 
   * @description Discount application (`automatic` and `manual`) 
   */
  application: DiscountApplicationEnum['Auto'] | DiscountApplicationEnum['Manual'];
}

/**
 * @description Discount upsert type
 */
export type DiscountTypeUpsert = DiscountType;

/** 
 * @description details and filters of the discount 
 */
export type DiscountInfo = {
  /** 
   * @description Discount details, decribes the `discount` type and more 
   */
  details: DiscountDetails;

  /** 
   * @description List of `discount` filters 
   * @minLength 1 You should Specify at least 1 Filter
   */
  filters: Filter[]
}

/** 
 * @description Discounts can be manual(coupon) or automatic types, 
 * see <a href='#DiscountApplicationEnum'>#DiscountApplicationEnum</a>  
 */
export type DiscountApplicationEnum = {
  Auto:   { id: 0, name: 'Automatic', name2: 'automatic'},
  Manual: { id: 1, name: 'Manual', name2: 'manual'},
}

/**
 * @description Filter for product in collections
 */
export type FilterValue_p_in_collections = { 
  /**
   * @description `p_in_collections` filter, `id` of collection
   */
  id?: string, 

  /**
   * `p_in_collections` filter, `handle` of the collection
   */
  handle?: string 
}[];

/**
 * @description Filter for product not in collections
 */
export type FilterValue_p_not_in_collections = { 
  /**
   * @description `p_not_in_collections` filter, `id` of collection
   */
  id?: string, 

  /**
   * `p_not_in_collections` filter, `handle` of the collection
   */
  handle?: string 
}[];

/**
 * @description Filter for product discount, product in handles
 */
export type FilterValue_p_in_handles = string[];

/**
 * @description Filter for product discount, product not in handles
 */
export type FilterValue_p_not_in_handles = string[];

/**
 * @description Filter for product discount, product has tags
 */
export type FilterValue_p_in_tags = string[];

/**
 * @description Filter for product discount, NOT has tags
 */
export type FilterValue_p_not_in_tags = string[];

/**
 * @description Filter for product discount, 
 * that chooses all products
 */
export type FilterValue_p_all = any;

/**
 * @description Filter for product discount, product in price range
 */
export type FilterValue_p_in_price_range = { 
  /**
   * @description `p_in_price_range` filter From price
   */
  from?: number, 

  /**
   * @description `p_in_price_range` filter To price
   */
  to: number 
};

/**
 * @description Filter for order discount, subtotal in range
 */
export type FilterValue_o_subtotal_in_range = { 
  /**
   * @description `o_subtotal_in_range` filter From price
   */
  from?: number, 

  /**
   * @description `o_subtotal_in_range` filter To price
   */
  to: number 
};

/**
 * @description Filter for order discount, items count in range
 */
export type FilterValue_o_items_count_in_range = { 
  /**
   * @description `o_items_count_in_range` filter From count
   */
  from?: number, 

  /**
   * @description `o_items_count_in_range` filter To count
   */
  to: number 
};

/**
 * @description Filter for order discount, subtotal in range
 */
export type FilterValue_o_date_in_range = { 
  /**
   * @description `o_date_in_range` filter From date timestamp
   */
  from?: number, 

  /**
   * @description `o_date_in_range` filter To date timestamp
   */
  to: number 
};

/**
 * @description Filter for order discount, order has customer id
 */
export type FilterValue_o_has_customers = string[];

/** 
 * @description Discount filter scheme 
 */
export type Filter = {
  /** 
   * @description Meta data related to identifying the filter 
   */
  meta: FilterMetaEnum['p_all'] | FilterMetaEnum['p_in_collections'] |
        FilterMetaEnum['p_not_in_collections'] | FilterMetaEnum['p_in_tags'] | 
        FilterMetaEnum['p_not_in_tags'] | FilterMetaEnum['p_in_handles'] |
        FilterMetaEnum['p_not_in_handles'] | FilterMetaEnum['o_date_in_range'] |
        FilterMetaEnum['o_has_customer'] | FilterMetaEnum['o_items_count_in_range'] |
        FilterMetaEnum['o_subtotal_in_range'];

  /** 
   * @description The filter params 
   */
  value?: FilterValue_p_in_collections | FilterValue_p_not_in_collections | 
          FilterValue_p_in_handles | FilterValue_p_not_in_handles | 
          FilterValue_p_in_tags | FilterValue_p_not_in_tags | 
          FilterValue_p_all | FilterValue_p_in_price_range | 
          FilterValue_o_subtotal_in_range | FilterValue_o_items_count_in_range |
          FilterValue_o_date_in_range | FilterValue_o_has_customers;
}

/**
 * @description Built in filters meta info for identification
 */
export interface FilterMetaEnum { 
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
 * @description The details of how to apply a discount. 
 * The type of discount and it's params 
 */
export type DiscountDetails = {
  /** 
   * @description metadata to identify the type of discount 
   */
  meta: DiscountMetaEnum['regular'] | DiscountMetaEnum['bulk'] | 
        DiscountMetaEnum['bundle'] | DiscountMetaEnum['buy_x_get_y'] | 
        DiscountMetaEnum['order'];

  /** 
   * @description Extra parameters of the specific discount type 
   */
  extra: RegularDiscountExtra | OrderDiscountExtra 
  | BulkDiscountExtra | BuyXGetYDiscountExtra 
  | BundleDiscountExtra;
}

/** 
 * @description Discount meta data, 
 * see <a href='#DiscountMetaEnum'>#DiscountMetaEnum</a>  
 */
export type DiscountMetaEnum = {
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
 *  @description Parameters of a regular discount 
 */
export type RegularDiscountExtra = {
  /** 
   * @description `RegularDiscountExtra` params, Fixed price addition 
   */
  fixed: number

  /** 
   * @description `RegularDiscountExtra` params, Percents off 
   */
  percent: number
}

/** 
 * @description Parameters of order discount 
 */
export type OrderDiscountExtra = {
  /** 
   * @description `OrderDiscountExtra` params, Fixed price addition 
   */
  fixed: number

  /** 
   * @description `OrderDiscountExtra` params, Percents off 
   */
  percent: number

  /** 
   * @description `OrderDiscountExtra` params, Do we have free shipping ? 
   */
  free_shipping?: boolean;
}

/** 
 * @description Parameters of bulk discount 
 */
export type BulkDiscountExtra = {
  /** 
   * @description `BulkDiscountExtra` params, Fixed price addition 
   */
  fixed: number

  /** 
   * @description `BulkDiscountExtra` params, Percents off 
   */
  percent: number;

  /** 
   * @description `BulkDiscountExtra` params, The integer quantity 
   * for which the discount is given 
   */
  qty: number

  /** 
   * @description `BulkDiscountExtra` params, Apply the discount as 
   * many times as possible 
   */
  recursive?: boolean
}

/** 
 * @description Parameters of bulk discount 
 */
export type BuyXGetYDiscountExtra = {
  /** 
   * @description `BuyXGetYDiscountExtra` params, Fixed price addition 
   */
  fixed: number

  /** 
   * @description `BuyXGetYDiscountExtra` params, Percents off 
   */
  percent: number;

  /** 
   * @description `BuyXGetYDiscountExtra` params, The integer 
   * quantity of BUY X 
   */
  qty_x: number

  /** 
   * @description `BuyXGetYDiscountExtra` params, The integer quantity 
   * of BUY Y 
   */
  qty_y: number

  /** 
   * @description `BuyXGetYDiscountExtra` params, The filters for what 
   * a customer gets (Y) 
   */
  filters_y: Filter[];

  /** 
   * @description `BuyXGetYDiscountExtra` params, Apply the discount 
   * as many times as possible 
   */
  recursive?: boolean
}

/** 
 * @description Parameters of bulk discount 
 */
export type BundleDiscountExtra = {
  /** 
   * @description `BundleDiscountExtra` params, Fixed price addition 
   */
  fixed: number

  /** 
   * @description `BundleDiscountExtra` params, Percents off 
   */
  percent: number
  
  /** 
   * @description `BundleDiscountExtra` params, Apply the discount 
   * as many times as possible 
   */
  recursive?: boolean
}

// storefront

/**
 * @description The `storefront` data type
 */
export interface StorefrontType extends BaseType {
  /** 
   * @description Is the entity active ?
   */
  active: boolean;
  
  /** 
   * @description Readable `handle` 
   */
  handle: string;

  /** 
   * @description Title 
   * @minLength 3 Title should be longer than 3
   */
  title: string;

  /** 
   * @description Video url 
   */
  video?: string;

  /** 
   * @description Storefronts may be exported to `json` for CDN, 
   * this is the `url`
   */
  published?: string;

  /** 
   * @description Collections related to this storefront 
   */
  collections?: CollectionType[];

  /** 
   * @description Products related to this storefront 
   */
  products?: ProductType[];

  /** 
   * @description Shipping methods related to this storefront 
   */
  shipping_methods?: ShippingMethodType[];

  /** 
   * @description Discounts related to this storefront 
   */
  discounts?: DiscountType[];

  /** 
   * @description Posts related to this storefront 
   */
  posts?: PostType[];
}

/** 
 * @description Storefront upsert type
 */
export type StorefrontTypeUpsert = StorefrontType;

//

/** 
 * @description Address type 
 */
export type AddressType = {
  /** 
   * @description First name of recipient 
   */
  firstname?: string;

  /** 
   * @description Last name of recipient 
   */
  lastname?: string;

  /**
   * @description The phone number of the recipient
   * @pattern ^([+]?d{1,2}[-s]?|)d{3}[-s]?d{3}[-s]?d{4}$ Invalid phone number
   */  
  phone_number?: string;

  /** 
   * @description Optional company name of recipient 
   */
  company?: string;

  /** 
   * @description Street address 1 
   */
  street1?: string;

  /** 
   * @description Street address 2 
   */
  street2?: string;

  /** 
   * @description City 
   */
  city?: string;

  /** 
   * @description Country 
   */
  country?: string;

  /** 
   * @description State 
   */
  state?: string;

  /** 
   * @description ZIP code 
   */
  zip_code?: string;

  /** 
   * @description Postal code 
   */
  postal_code?: string;  
}

/**
 * @description Customer type
 */
export interface CustomerType extends BaseType {
  /** 
   * @description The `auth id` of the customer. it is the same as
   * customer `id` with `au` prefix instead
   */
  auth_id?: string;

  /** 
   * @description Firstname 
   * @minLength 1 Should be longer than 1 characters
   */
  firstname: string;

  /** 
   * @description Lastname 
   * @minLength 1 Should be longer than 1 characters
   */
  lastname: string;

  /**
   * @description Email of customer
   * @format email
   */
  email: string;

  /**
   * @description The phone number
   * @pattern ^([+]?d{1,2}[-s]?|)d{3}[-s]?d{3}[-s]?d{4}$
   */  
  phone_number?: string;

  /** 
   * @description Address info of customer 
   */
  address?: AddressType;
}

/**
 * @description Customer upsert type
 */
export type CustomerTypeUpsert = CustomerType;

// image

/**
 * @description Image type
 */
export interface ImageType extends BaseType {
  /** 
   * @description Unique handle 
   */
  handle: string;

  /** 
   * @description Name 
   * @minLength 1 Should be longer than 1 characters
   */
  name: string;

  /** 
   * @description It's published public url 
   * @minLength 1 Should be longer than 1 characters
   */
  url: string;

  /** 
   * @description List of assets using this image 
   */
  usage?: string[];
}

/**
 * @description Image upsert type
 */
export type ImageTypeUpsert = ImageType;

// shipping


/**
 * Shipping type
 */
export interface ShippingMethodType extends BaseType {
  /**
   * @description Shipping method price
   * @minimum 0 Please set a price >= 0
   */
  price: number;

  /** 
   * @description Name of shipping method 
   * @minLength 3 Title should be longer than 3
   */
  title: string;

  /**
   * @description Readable `handle` of shipping
   */
  handle: string;
}

/**
 * @description Shipping upsert type
 */
export type ShippingMethodTypeUpsert = ShippingMethodType;

// posts

/**
 * Post type
 */
export interface PostType extends BaseType {
  /** 
   * @description Unique `handle` 
   */
  handle: string;

  /** 
   * @description Title of post 
   * @minLength 3 Title should be longer than 3
   */
  title: string;

  /** 
   * @description Rich text of post 
   */
  text: string;
}

/**
 * @description Post upsert type
 */
export type PostTypeUpsert = PostType;

// settings


/**
 * @description Settings type
 */
export interface SettingsType extends BaseType {

}


// notifications

/**
 * @description Base Notification type
 */
interface BaseNotificationType {
  /** 
   * @description Message of notification, can be markdown, 
   * markup or plain text 
   */
  message: string;

  /** 
   * @description Author of the notification 
   */
  author?: string;

  /** 
   * @description List of actions 
   */
  actions?: NotificationAction[];

  /**
   * @description search terms
   */
  search?: string[];

  /**
   * @description `id` of notification
   */
  id?: string;
}

/**
 * @description Notification type
 */
export interface NotificationType extends BaseNotificationType, timestamps {
}

/**
 * @description Notification upsert type
 */
export interface NotificationTypeUpsert extends BaseNotificationType {
}

/** 
 * @description Each notification may have an actionable item 
 * associated with it. For example, clicking an order notification 
 * will route to the order page */
export type NotificationAction = {
  /** 
   * @description Name of the action 
   */
  name?: string;

  /** 
   * @description The type of action 
   */
  type?: NotificationActionType;

  /** 
   * @description Extra params for the actions type 
   */
  params?: NotificationActionRouteParams | NotificationActionUrlParams;
}

/** 
 * @description 'route' means routing inside admin panel 'url' is linking to a url 
 */
export type NotificationActionType = 'route' | 'url';

/** 
 * @description route inside admin panel action params 
 */
export type NotificationActionRouteParams = {
  /** 
   * @description Which collection 
   */
  collection: string;

  /** 
   * @description Which document 
   */
  document: string;
}

/** 
 * @description Action params for actions of type 'url' 
 */
export type NotificationActionUrlParams = {
  /** 
   * @description Ppen the url in new window 
   */
  new_window?: boolean;

  /** 
   * @description The url to open 
   */
  url: string;
}


// order types

/**
 * @description Base Checkout type
 */
export interface BaseCheckoutCreateType {
  /** 
   * @description Buyer info 
   */
  contact?: OrderContact;

  /** 
   * @description Shipping address info 
   */
  address?: AddressType;

  /** 
   * @description Line items is a list of the purchased products 
   */
  line_items: LineItem[];

  /** 
   * @description Notes for the order 
   */
  notes?: string; 

  /** 
   * @description Shipping method info 
   */
  shipping_method: ShippingMethodType; 
}

/**
 * @description Checkout Create type
 */
export interface CheckoutCreateType extends BaseCheckoutCreateType {
  /** 
   * @description A list of manual coupons handles 
   */
  coupons?: DiscountType["handle"][]; 
}

/**
 * @description Order type
 */
export interface OrderData extends BaseCheckoutCreateType, BaseType {
  /** 
   * @description Status of `checkout`, `fulfillment` and `payment` 
   */
  status: OrderStatus; 

  /** 
   * @description Pricing information 
   */
  pricing: PricingData;

  /** 
   * @description In case the order went through validation  
   */
  validation?: ValidationEntry[];

  /** 
   * @description Payment gateway info and status 
   */
  payment_gateway?: OrderPaymentGatewayData; 

  /** 
   * @description A list of manual coupons snapshots that were used 
   */
  coupons?: DiscountType[]; 
}

/**
 * @description Order upsert type
 */
export type OrderDataUpsert = OrderData;



/** 
 * @description Order buyer info 
 */
export type OrderContact = {
  /**
   * @description First name
   */
  firstname?: string;

  /**
   * @description Last name
   */
  lastname?: string;

  /**
   * @description Phone number
   */
  phone_number?: string;

  /**
   * @description Email
   */
  email?: string;

  /**
   * @description Customer `id`
   */
  customer_id?: string;
}

/** 
 * @description Status of `checkout`, `fulfillment` and `payment` 
 */
export type OrderStatus = {
  /**
   * @description `checkout` status
   */
  checkout: CheckoutStatusEnum['complete'] | CheckoutStatusEnum['created'] | 
            CheckoutStatusEnum['failed'] | CheckoutStatusEnum['requires_action'] |
            CheckoutStatusEnum['unknown'];

  /**
   * @description `payment` status
   */
  payment: PaymentOptionsEnum['authorized'] | PaymentOptionsEnum['captured'] |
           PaymentOptionsEnum['failed'] | PaymentOptionsEnum['partially_paid'] | 
           PaymentOptionsEnum['partially_refunded'] | PaymentOptionsEnum['refunded'] |
           PaymentOptionsEnum['requires_auth'] | PaymentOptionsEnum['unpaid'] | 
           PaymentOptionsEnum['voided'];

  /**
   * @description `fulfillment` status
   */
  fulfillment: FulfillOptionsEnum['cancelled'] | FulfillOptionsEnum['draft'] |
               FulfillOptionsEnum['fulfilled'] | FulfillOptionsEnum['processing'] | 
               FulfillOptionsEnum['shipped'];
}

/** 
 * @description Fulfillment options encapsulate the current state, 
 * see <a href='#FulfillOptionsEnum'>#FulfillOptionsEnum</a>  
 */
export type FulfillOptionsEnum = {
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
 * @description Payment options encapsulate the current state, 
 * see <a href='#PaymentOptionsEnum'>#PaymentOptionsEnum</a>  
 */
export type PaymentOptionsEnum = {
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
 * @description Checkout status encapsulate the current state, 
 * see <a href='#CheckoutStatusEnum'>#CheckoutStatusEnum</a>  
 */
export type CheckoutStatusEnum = {
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
 * @description Pricing object exaplins how the pricing of an order 
 * was calculated given a stack of automatic discounts, coupons, 
 * line items and shipping method 
 */
export type PricingData = {
  /** 
   * @description Explanation of how discounts stack and change pricing 
   */
  evo?: EvoEntry[]; 

  /** 
   * @description Selected shipping method 
   */
  shipping_method?: ShippingMethodType;

  /** 
   * @description Subtotal of items price before discounts 
   */
  subtotal_undiscounted: number; 

  /** 
   * @description Sum of all discounts at all stages 
   */
  subtotal_discount: number; 

  /** 
   * @description `subtotal_undiscounted` - `subtotal_discount` */
  subtotal: number; 

  /** 
   * @description `subtotal` + `shipping` 
   */
  total: number; 

  /** 
   * @description How many items are eligible 
   */
  quantity_total: number; 

  /** 
   * @description How many items were discounted 
   */
  quantity_discounted: number;

  /** 
   * @description Authentication user id 
   */
  uid?: string; 

  /**
   * @description Errors
   */
  errors?: DiscountError[];
}


/** 
 * @description A line item is a product, that appeared in an order 
 */
export type LineItem = {
  /**  
   * @description `id` or `handle` of product 
   */
  id: string;

  /** 
   * @description Product price snapshot
   */
  price?: number; 

  /** 
   * @description Integer quantity of how many such products 
   * were bought 
   */
  qty: number;

  /** 
   * @description Used by order to indicate it has reserved stock 
   * and it's amount 
   */
  stock_reserved?: number; 

  /** 
   * @description (optional) the product data snapshot for 
   * future integrity
   */
  data?: ProductType;
}

/**
 * @description Discount error type
 */
export type DiscountError = {
  /**
   * @description `handle` of the discount
   */
  discount_code: string;

  /**
   * @description Error message
   */
  message: string;
}

/** 
 * @description Explains how a specific discount was used 
 * to discount line items 
 */
export type EvoEntry = {
  /**
   * @description Discount at this step
   */
  discount?: DiscountType;

  /** 
   * @description The discount code `handle`
   */
  discount_code?: string;

  /** 
   * @description The amount of money that was discounted 
   * by this discount 
   */
  total_discount?: number;

  /** 
   * @description How many items are left to discount 
   */
  quantity_undiscounted?: number;

  /** 
   * @description How many items were discounted now 
   */
  quantity_discounted?: number;

  /** 
   * @description Running subtotal without shipping 
   */
  subtotal?: number;

  /** 
   * @description Running total 
   */
  total?: number;

  /** 
   * @description Available line items after discount 
   */
  line_items?: LineItem[];
}


/** 
 * @description Checkouts or draft orders might be validated 
 * in automatic systems 
 */
export type ValidationEntry = {
  /**
   * @description `id`
   */
  id: string;

  /**
   * @description title
   * @minLength 3 Title should be longer than 3
   */
  title?: string;

  /**
   * @description message
   */
  message?: 'out-of-stock' | 'not-enough-stock' | 'some-stock-is-on-hold';
}

/** 
 * @description How did the order interacted with a payment gateway ?  
 */
export type OrderPaymentGatewayData = {
  /** 
   * @description The payment gateway identifier 
   */
  gateway_handle: string;

  /** 
   * @description Result of gateway at checkout creation, this will later be given
   * to the `payment gateway` on any interaction, which will use it to identify the payment.
   */
  on_checkout_create?: any;

  /** 
   * @description Latest status of payment for caching 
   */
  latest_status?: any; 
}


// statistics

/**
 * @description Stats of an `entity` in a day
 */
export type OrdersStatisticsEntity = {
  /**
   * @description `handle` of entity
   */
  handle?: string;

  /**
   * @description `id` of entity
   */
  id?: string;

  /**
   * @description `title` of entity
   */  
  title?: string;

  /**
   * @description `count` of entity occurences in the day
   */  
  count?: number;

  [x: string]: any;
}

export type OrdersStatisticsDayMetric = {

  /**
   * @description The total income in a day for a metric
   */
  total_income?: number;

  /**
   * @description The `count` of orders in a day for a metric
   */
  count?: number;
}

/**
 * @description Stats of a day
 */
export type OrdersStatisticsDay = {

  /**
   * @description metrics for many `order` statuses
   */
  metrics: {
    payments_captured?: OrdersStatisticsDayMetric,
    payments_failed?: OrdersStatisticsDayMetric,
    payments_unpaid?: OrdersStatisticsDayMetric,
    checkouts_created?: OrdersStatisticsDayMetric,
    checkouts_completed?: OrdersStatisticsDayMetric,
    fulfillment_draft?: OrdersStatisticsDayMetric,
    fulfillment_shipped?: OrdersStatisticsDayMetric,
    fulfillment_processing?: OrdersStatisticsDayMetric,
    fulfillment_cancelled?: OrdersStatisticsDayMetric,
  }

  /**
   * @description The date in string `ISO` / `UTC` / `timestamp` format
   */
  day: string | number;

  /**
   * @description The `products` found in all created orders
   */
  products?: Record<Handle | ID, OrdersStatisticsEntity>;

  /**
   * @description The `collections` found in all created orders
   */
  collections?: Record<Handle | ID, OrdersStatisticsEntity>;

  /**
   * @description The `discounts` found in all created orders
   */
  discounts?: Record<Handle | ID, OrdersStatisticsEntity>;

  /**
   * @description The `tags` found in all created orders `products`
   */
  tags?: Record<Handle | ID, OrdersStatisticsEntity>;
}


/**
 * @description `Statisitics` of requested days
 */
export type OrdersStatisticsType = {

  /**
   * @description The days statistics
   */
  days?: Record<number | string, OrdersStatisticsDay>;

  /**
   * @description The date in string `ISO` / `UTC` / `timestamp` format
   */
  from_day?: string | number;

  /**
   * @description The date in string `ISO` / `UTC` / `timestamp` format
   */
  to_day?: string | number;

  /**
   * @description The count of days in `from_day` to `to_day`
   */
  count_days?: number
}


