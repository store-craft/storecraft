/**
 * 
 * @description Basic config for `storecraft`
 */
export type StorecraftConfig = {

  /**
   *  
   * @description The store name
   * `platform.env.SC_GENERAL_STORE_NAME` environment
   */
  general_store_name?: string;

  /**
   *  
   * @description The store `website`
   * `platform.env.SC_GENERAL_STORE_WEBSITE` environment
   */
  general_store_website?: string;


  /**
   *  
   * @description The store `logo` url
   * `platform.env.SC_GENERAL_STORE_LOGO_URL` environment
   */
  general_store_logo_url?: string;


  /**
   *  
   * @description The store `description`
   * `platform.env.SC_GENERAL_STORE_DESCRIPTION` environment
   */
  general_store_description?: string;

  /**
   *  
   * @description The store support email
   * `platform.env.SC_GENERAL_STORE_SUPPORT_EMAIL` environment
   */
  general_store_support_email?: string;

  /**
   *  
   * @description The store `email-confirm`
   * `platform.env.SC_GENERAL_STORE_CONFIRM_EMAIL_BASE_URL` environment
   */
  general_confirm_email_base_url?: string;
  

  /**
   *  
   * @description Seed admin emails, if absent will be infered at init by 
   * `platform.env.SC_AUTH_ADMIN_EMAILS` environment as CSV of emails 
   */
  auth_admins_emails?: string[];

  /** 
   * 
   * @description access token signing secret, if absent will be infered 
   * at init by `platform.env.SC_AUTH_SECRET_ACCESS_TOKEN` environment  
   */
  auth_secret_access_token: string;

  /** 
   * 
   * @description refresh token signing secret, if absent will be infered at 
   * init by `platform.env.SC_AUTH_SECRET_REFRESH_TOKEN` environment  
   */
  auth_secret_refresh_token: string;

  /** 
   * 
   * @description (Optional) automatically reserve stock, we recommend to use `never`.
   * Depending on your needs you can alter this setting.
   * if absent will be infered at init by `platform.env.SC_CHECKOUT_RESERVE_STOCK_ON` 
   * environment and then will default to `never`.
   * @default never
   */
  checkout_reserve_stock_on?: 'checkout_create' | 'checkout_complete' | 'never'

  /** 
   * 
   * @description (Optional) Once object `storage` is used, you may have connected a 
   * **CDN** to buckets to take advantage of faster assets serving instead of serving 
   * from your server / the storage service directly. If you are using an cloud based 
   * storage service such as AWS S3, it is very recommended to attach the bucket to 
   * a **CDN** for super fast and efficient serving.
   * 
   * Take note, most cloud based storage services and `storecraft` drivers support creating 
   * `presigned` urls for `download` / `upload`, which essentially delegate these operations
   * to the storage services. However, **CDN** is always the best choice for assets serving
   * cost and latency wise.
   * 
   * if absent will be infered at init by `platform.env.SC_STORAGE_REWRITE_URLS` environment.
   * @default undefined
   */
  storage_rewrite_urls?: string;

  /**
   * @description (Optional) Your chance to override the default `CORS` config
   * for HTTP requests
   * 
   */
  cors?: CORSOptions;
}

export type CORSOptions = {
  origin: string | string[] | ((origin: string) => string | undefined | null);
  allowMethods?: string[];
  allowHeaders?: string[];
  exposeHeaders?: string[];
  maxAge?: number;
  credentials?: boolean;
}


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
 * @description with `id`
 */
export type idable_concrete = {
  /** 
   * @description ID 
   */
  id: string;
}

export type withOptionalHandleOrID = {
  /** 
   * @description Optional `id`
   */
  id?: string;

  /** 
   * @description Optional `handle`
   */
  handle?: string;
}


/** 
 * @description Base properties 
 */
export interface BaseType extends idable_concrete, timestamps {
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
 * @description Change Password Type
 */
export type ApiAuthChangePasswordType = {

  /**
   * @description User `ID` or `Email`
   */
  user_id_or_email: string;

  /**
   * @description Current password
   */
  current_password: string;

  /**
   * @description New password
   */
  new_password: string;

  /**
   * @description Again New password for confirmation
   */
  confirm_new_password: string;
};

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
 * @description Result of `auth` request for `signin` / `signup` / `refresh`
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
export type AuthUserType = Omit<BaseType, 'id'> & AuthBaseType & {
  /** 
   * @description ID 
   */
  id: string;

  /**
   * @description Is the email confirmed ?
   */
  confirmed_mail?: boolean

  /**
   * @description list of roles and authorizations of the user
   */
  roles?: Role[];

  /**
   * @description tags
   */
  tags?: string[];
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
export type TagTypeUpsert = Omit<TagType, 'id' | 'handle'> & withOptionalHandleOrID;
  
// collections

/**
 * @description Collection type
 */
export interface CollectionType extends BaseType {

  /** 
   * @description The `handle` of the entity
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
export type CollectionTypeUpsert = Omit<CollectionType, 'id' | 'handle'> & withOptionalHandleOrID;


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
   * @minLength 3 Name should be longer than 3
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
  handle: string;

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
export type VariantTypeUpsert = Omit<
  VariantType, 
  'collections' | 'published' | 'discounts' | 'related_products' | 'id' | 'handle'> & {
  /** 
   * @description List of collections to add the product into, 
   * this is an explicit connection, to form a better UX experience 
   */
  collections?: HandleAndID[];

  /** 
   * @description List of related products to add the product into, 
   * this is an explicit connection, to form a better UX experience 
   */
  related_products?: Pick<BaseProductType, 'id' | 'handle'>[];
} & withOptionalHandleOrID;


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
 * @description both `id` and `handle` of entity required
 */
export type HandleAndID = {

  /** 
   * @description The `id` of the entity
   */
  id: string;

  /** 
   * @description The `handle` of the entity
   */
  handle: string;
}


/**
 * @description Product upsert type
 */
export type ProductTypeUpsert = Omit<
  ProductType, 
  'collections' | 'published' | 'related_products' | 'discounts' | 'variants' | 'id' | 'handle'
  > & {

  /** 
   * @description List of collections to add the product into, 
   * this is an explicit connection, to form a better UX experience 
   */
  collections?: HandleAndID[];

  /** 
   * @description List of related products to add the product into, 
   * this is an explicit connection, to form a better UX experience 
   */
  related_products?: HandleAndID[];
} & withOptionalHandleOrID;



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
  application: DiscountApplicationEnum["Auto"] | DiscountApplicationEnum["Manual"] | { id: number, name?: string, name2: string };
}


/**
 * @description Discount upsert type
 */
export type DiscountTypeUpsert = Omit<DiscountType, 'id' | 'handle'> & withOptionalHandleOrID;

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
  Auto:   { id: 0, name?: string, name2: 'automatic'},
  Manual: { id: 1, name?: string, name2: 'manual'},
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
   * @description `p_in_collections` filter, `title` of collection
   */
  title?: string, 

  /**
   * @description `p_in_collections` filter, `handle` of the collection
   */
  handle?: string,
}[];

/**
 * @description Filter for product not in collections
 */
export type FilterValue_p_not_in_collections = FilterValue_p_in_collections;


/**
 * @description Filter for product discount, product in handles
 */
export type FilterValue_p_in_products = { 
  /**
   * @description `p_in_products` filter, `id` of `product`
   */
  id?: string, 

  /**
   * @description `p_in_products` filter, `title` of `product`
   */
  title?: string, 

  /**
   * @description `p_in_products` filter, `handle` of the `product`
   */
  handle?: string 
}[];


/**
 * @description Filter for product discount, product not in handles
 */
export type FilterValue_p_not_in_products = FilterValue_p_in_products;

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
export type FilterValue_p_all = {};

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
  to?: number 
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
  to?: number 
};

/**
 * @description Filter for order discount, subtotal in range
 */
export type FilterValue_o_date_in_range = { 
  /**
   * @description `o_date_in_range` filter From date `ISO` format
   */
  from?: string, 

  /**
   * @description `o_date_in_range` filter To date `ISO` format
   */
  to?: string 
};

/**
 * @description Filter for order discount, order has customer id
 */
export type FilterValue_o_has_customers = { 
  /**
   * @description `id` of `customer`
   */
  id: string, 

  /**
   * @description (optional) `email` of `customer`
   */
  email?: string, 

  /**
   * @description (optional) readable `name` of `customer`
   */
  firstname?: string 

  /**
   * @description (optional) readable `name` of `customer`
   */
  lastname?: string 
}[];

/** 
 * @description Discount filter schema
 */
export type Filter = {
  /** 
   * @description Meta data related to identifying the filter 
   */
  meta: FilterMetaEnum['p_all'] | FilterMetaEnum['p_in_collections'] |
        FilterMetaEnum['p_not_in_collections'] | FilterMetaEnum['p_in_tags'] | 
        FilterMetaEnum['p_not_in_tags'] | FilterMetaEnum['p_in_products'] |
        FilterMetaEnum['p_not_in_products'] | FilterMetaEnum["p_in_price_range"] | 
        FilterMetaEnum['o_date_in_range'] | FilterMetaEnum['o_has_customer'] | 
        FilterMetaEnum['o_items_count_in_range'] | FilterMetaEnum['o_subtotal_in_range'] | 
        FilterMetaEnum["any"];

  /** 
   * @description The filter params 
   */
  value?: FilterValue_p_in_collections | FilterValue_p_not_in_collections | 
          FilterValue_p_in_products | FilterValue_p_not_in_products | 
          FilterValue_p_in_tags | FilterValue_p_not_in_tags | 
          FilterValue_p_in_price_range | 
          FilterValue_o_subtotal_in_range | FilterValue_o_items_count_in_range |
          FilterValue_o_date_in_range | FilterValue_o_has_customers;
}

/**
 * @description Built in filters meta info for identification
 */
export interface FilterMetaEnum { 
  any: { // This is for future flexibility against zod
    id: number, type: string, 
    op: string, 
    name?: string
  },
  p_in_collections: { 
    id: 0, type:'product', 
    op: 'p-in-collections', 
    name?: string
  },
  p_not_in_collections: { 
    id: 1, type:'product', 
    op: 'p-not-in-collections', 
    name?: string
  },
  p_in_products: {
    id: 2, type:'product', 
    op: 'p-in-products', 
    name?: string
  },
  p_not_in_products: { 
    id: 3, type:'product', 
    op: 'p-not-in-products', 
    name?: string
  },
  p_in_tags: { 
    id: 4, type:'product', 
    op: 'p-in-tags', 
    name?: string
  },
  p_not_in_tags: {
    id: 5, type:'product', 
    op: 'p-not-in-tags', 
    name?: string
  },    
  p_all: {
    id: 6, type:'product', 
    op: 'p-all', 
    name?: string
  },    
  p_in_price_range: {
    id: 7, type:'product', 
    op: 'p-in-price-range', 
    name?: string
  },    
  o_subtotal_in_range: {
    id: 100, type:'order', 
    op: 'o-subtotal-in-range', 
    name?: string
  },    
  o_items_count_in_range: {
    id: 101, type:'order', 
    op: 'o-items-count-in-range', 
    name?: string
  },    
  o_date_in_range: {
    id: 102, type:'order', 
    op: 'o-date-in-range', 
    name?: string
  },    
  o_has_customer: {
    id: 103, type:'order', 
    op: 'o-has-customer', 
    name?: string
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
        DiscountMetaEnum['order'] | DiscountMetaEnum['any'];


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
    name?: string, 
  },
  bulk: { 
    id: 1, type: 'bulk',          
    name?: string, 
  },
  buy_x_get_y: { 
    id: 2, type: 'buy_x_get_y' ,  
    name?: string,
  },
  order: { 
    id: 3, type: 'order', 
    name?: string,
  },
  bundle: { 
    id: 4, type: 'bundle', 
    name?: string,
  },
  any: { 
    id: number, type: string, 
    name?: string,
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
export type StorefrontTypeUpsert = Omit<
  StorefrontType,
  'collections' | 'products' | 'posts' | 'discounts' | 'shipping_methods' | 'id' | 'handle'> & {

  /** 
   * @description Collections related to this storefront 
   */
  collections?: HandleAndID[];

  /** 
   * @description Products related to this storefront 
   */
  products?: HandleAndID[];

  /** 
   * @description Shipping methods related to this storefront 
   */
  shipping_methods?: HandleAndID[];

  /** 
   * @description Discounts related to this storefront 
   */
  discounts?: HandleAndID[];

  /** 
   * @description Posts related to this storefront 
   */
  posts?: HandleAndID[];

} & withOptionalHandleOrID;

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
export type CustomerTypeUpsert = Omit<CustomerType, 'id' | 'handle'> & withOptionalHandleOrID;

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
export type ImageTypeUpsert = Omit<ImageType, 'id' | 'handle'> & withOptionalHandleOrID;

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
export type ShippingMethodTypeUpsert = Omit<ShippingMethodType, 'id' | 'handle'> & withOptionalHandleOrID;

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
export type PostTypeUpsert = Omit<PostType, 'id' | 'handle'> & withOptionalHandleOrID;

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
   * @description `ID` in case we are converting a draft order to a checkout 
   */
  id?: string;

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
  shipping_method: Partial<ShippingMethodType>; 
}

/**
 * @description Checkout Create type
 */
export interface CheckoutCreateType extends BaseCheckoutCreateType {
  /** 
   * @description A list of manual coupons handles 
   */
  coupons?: DiscountType[]; 
}

/**
 * @description Order type
 */
export interface OrderData extends Omit<CheckoutCreateType, 'id'>, BaseType {
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

}

/**
 * @description Order upsert type
 */
export type OrderDataUpsert = Omit<OrderData, 'id'> & withOptionalHandleOrID;



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
            CheckoutStatusEnum['unknown'] | { id: number, name2: string };

  /**
   * @description `payment` status
   */
  payment: PaymentOptionsEnum['authorized'] | PaymentOptionsEnum['captured'] |
           PaymentOptionsEnum['failed'] | PaymentOptionsEnum['partially_paid'] | 
           PaymentOptionsEnum['partially_refunded'] | PaymentOptionsEnum['refunded'] |
           PaymentOptionsEnum['requires_auth'] | PaymentOptionsEnum['unpaid'] | 
           PaymentOptionsEnum['voided'] | { id: number, name2: string };

  /**
   * @description `fulfillment` status
   */
  fulfillment: FulfillOptionsEnum['cancelled'] | FulfillOptionsEnum['draft'] |
               FulfillOptionsEnum['fulfilled'] | FulfillOptionsEnum['processing'] | 
               FulfillOptionsEnum['shipped'] | { id: number, name2: string };
}

/** 
 * @description Fulfillment options encapsulate the current state, 
 * see <a href='#FulfillOptionsEnum'>#FulfillOptionsEnum</a>  
 */
export type FulfillOptionsEnum = {
  draft: { 
    id: 0, name2: 'draft', name?: string
  },
  processing: { 
    id: 1, name2: 'processing' ,name?: string
  },
  shipped: { 
    id: 2, name2: 'shipped' ,name?: string
  },
  fulfilled: { 
    id: 3, name2: 'fulfilled', name?: string
  },
  cancelled: { 
    id: 4, name2: 'cancelled', name?: string
  }
}


/** 
 * @description Payment options encapsulate the current state, 
 * see <a href='#PaymentOptionsEnum'>#PaymentOptionsEnum</a>  
 */
export type PaymentOptionsEnum = {
  unpaid: { 
    id: 0, name?: string, name2: 'unpaid'
  },
  authorized: { 
    id: 1, name?: string, name2: 'authorized'
  },
  captured: { 
    id: 2, name?: string, name2: 'captured'
  },
  requires_auth: { 
    id: 3, name?: string, name2: 'requires_auth'
  },
  voided: { 
    id: 4, name?: string, name2: 'voided'
  },
  failed: { 
    id: 5, name?: string, name2: 'failed'
  },
  partially_paid: { 
    id: 6, name?: string, name2: 'partially_paid' 
  },
  refunded: { 
    id: 7, name?: string, name2: 'refunded' 
  },
  partially_refunded: { 
    id: 8, name?: string, name2: 'partially_refunded' 
  },
}


/** 
 * @description Checkout status encapsulate the current state, 
 * see <a href='#CheckoutStatusEnum'>#CheckoutStatusEnum</a>  
 */
export type CheckoutStatusEnum = {
  created: { 
    id: 0, name2: 'created', name?: string
  },
  requires_action: { 
    id: 1, name2: 'requires_action', name?: string
  },
  failed: { 
    id: 2, name2: 'failed', name?: string
  },
  complete: { 
    id: 3, name2: 'complete', name?: string
  },
  unknown: { 
    id: 4, name2: 'unknown', name?: string
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
  line_items_next?: LineItem[];
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
  message?: 'shipping-method-not-found' | 'product-not-exists' | 
            'product-out-of-stock' | 'product-not-enough-stock' |
            'product-inactive';
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
  latest_status?: PaymentGatewayStatus; 
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


// extensions



export type ConfigField = {
  /**
   * @description the `key` of the field
   */
  key: string;

  /**
   * @description the `value` of the field
   */
  value?: any;

  /**
   * @description the `description` of the field
   */
  description?: string;

  /**
   * @description the `name` of the field
   */
  name: string;
  
  /**
   * @description Is the field editable ?
   */
  editable?: boolean;

  /**
   * @description The type of the `field`
   */
  metadata: {
    component: 'select' | 'input' | 'label' | 'textarea';
    params: any;
  }

}

/**
 * @description `extension` description, logos and urls
 */
export type ExtensionInfo = {
  /** 
   * 
   * @description name of the `extension` 
   */
  name: string;

  /** 
   * @description description of the `extension` 
   */
  description?: string;

  /** 
   * @description logo url (or even data-url) of the `extension` 
   */
  logo_url?: string;

  /** 
   * @description url of the extension website 
   */
  url?: string;
}


/**
 * @description Every `extension` have `actions`,  that are registered as 
 * **REST** endpoints
 */
export type ExtensionAction = {
  /** 
   * @description action name for display 
   */
  name: string;

  /** 
   * @description action handle for invocation at backend 
   */
  handle: string;

  /** 
   * @description optional description of what will happen 
   * if the action is executed 
   */
  description?: string;
}

/**
 * 
 * @description Upon querying the `extension`
 */
export type ExtensionItemGet = {
  /**
   * @description The info such as `name`, `description` etc..
   */
  info: ExtensionInfo,
  
  /**
   * @description A list of `actions` supported by the `extension`
   */
  actions: ExtensionAction[],

  /**
   * @description The extension's configuration
   */
  config: any,

  /**
   * @description The `handle` of the `extension`
   */
  handle: string;
}


// payments


/**
 * @description Payment gateway description, logos and urls
 */
export type PaymentGatewayInfo = ExtensionInfo

/**
 * @description Upon status query, the gateway return a list of possible actions,
 * such as `void`, `capture`, `refund` etc... 
 */
export type PaymentGatewayAction = ExtensionAction & {

  /**
   * @description Action might have extra parameters, 
   * for example a partial refund action, may specify a variable value 
   * for refunding, also with some of the `capture` actions, 
   * which may capture less than intended.
   */
  parameters?: ConfigField[]
}

/** 
 * @description A payment `status`
 */
export type PaymentGatewayStatus = {
  /** 
   * @description List of possible actions to take 
   */
  actions?: PaymentGatewayAction[];

  /** 
   * @description A list of messages of the current payment status, 
   * for example `150$ were authorized...` 
   */
  messages?: string[];
}


/**
 * 
 * @description Upon querying the payment gateways
 */
export type PaymentGatewayItemGet = {
  /**
   * @description The info such as `name`, `description` etc..
   */
  info: PaymentGatewayInfo,
  
  /**
   * @description A list of `actions` supported by the gateway
   */
  actions: PaymentGatewayAction[],

  /**
   * @description The gateway's configuration
   */
  config: any,

  /**
   * @description The `handle` of the `gateway`
   */
  handle: string;
}


// email templates

/**
 * @description `Email Template` type
 */
export interface TemplateType extends BaseType {

  /**
   * @description `handle`
   */
  handle?: string;

  /**
   * @description `title` of `template`
   */
  title: string;

  /**
   * @description The **HTML** `template` `handlebars` string
   */
  template_html?: string;

  /**
   * @description The **TEXT** `template` `handlebars` string
   */
  template_text?: string;

  /**
   * @description A reference example input for the template
   */
  reference_example_input?: any;
}

/**
 * @description Upsert type for email template
 */
export type TemplateTypeUpsert = Omit<TemplateType, 'id' | 'handle'> & withOptionalHandleOrID;


// quick search

/**
 * @description result of quick search for a specific `resource`
 */
export type QuickSearchResource = {
  id: string;
  handle?: string;
  title?: string;
}

/**
 * @description full result of quick search
 * 
 */
export type tables = 'auth_users' | 'tags' | 'collections' | 
    'customers' | 'products' | 'storefronts' | 'images' | 'posts' |
    'templates' | 'shipping_methods' | 'notifications' |
    'discounts' | 'orders' | 'search';


export type QuickSearchResult = Record<tables, QuickSearchResource[]>;