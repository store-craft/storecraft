
/** Base properties */
type BaseType = {
  updated_at?: string;
  created_at?: string;
  id?: string;
  /** List of images urls */
  media?: string[];
  /** List of attributes */
  attributes?: AttributeType[];
  /** list of tags , example ['genere_action', 'rated_M', ...] */
  tags?: string[];
  /** Rich description */
  desc?: string;
  /** Is the entity active ? */
  active?: boolean;
}

// auth

export type AuthBaseType = {
  /**
   * @format email
   */
  email: string;
  /**
   * @minLength 4
   * @maxLength 20   
   */
  password: string;
}

export type Role2 = {
  admin: {
    type: 'admin'
  },
  user: {
    type: 'user'
  },
}

export type Role = 'admin' | 'user' | string;

export type ApiAuthLoginType = AuthBaseType;
export type ApiAuthSignupType = AuthBaseType;
export type ApiAuthRefreshType = {
  refresh_token: string;
}

export type AuthUserType = BaseType & AuthBaseType & {
  confirmed_mail?: boolean
  roles?: Role[];
}

// attributes

export type AttributeType = {
  key: string;
  value?: string;
}


// tag type

export type TagType = BaseType & {
  /** the key name */
  handle: string;
  /** list of values */
  values: string[];
}

// collections

export type CollectionType = BaseType & {
  /** the key name */
  handle: string;
  /** title of collection */
  title: string;
  /** status */
  active: boolean;
  /** published json url */
  _published?: string;
}

// products

/** A tuple of option id and selected value id */
export type VariantCombination = {
  /** a list of selection of option and value */
  selection: VariantOptionSelection[];
  /** the product data associated with this variant */
  product: ProductType;
}

/** The data of a variant option */
export type VariantOption = {
  /** variant option name (for example 'Size') */
  name: string;
  /** variant option id */
  id: string;
  /** variant option values (for example 'Small' / 'Medium' / 'Large' ..) */
  values: TextEntity[];
}

export type TextEntity = {
  /** the id of the entity */
  id: string;
  /** the text value of the entity */
  value: string;
}

export type VariantOptionSelection = {
  /** Variant option id */
  option_id: string;
  /** Variant selected value id */
  value_id: string;
}

export type ProductType = BaseType & {
  /** the key name */
  handle: string;
  /** title of collection */
  title: string;
  /** status */
  active: boolean;
  /** handles of collection this product belongs to */
  collections: string[];
  /** video media url */
  video?: string;
  /** 
   * price 
   * @minimum 0
   */
  price: number;
  /** 
   * integer stock quantity 
   * @minimum 0
   */
  qty: number;
  /** 
   * compare at price point 
   * @minimum 0
   */
  compare_at_price?: number;

  /** handle of parent product in case this product is a variant */
  parent_handle?: string;
  /** variants options info */
  variants_options?: VariantOption[];
  /** mapping of product variants handles to product data and variants options selection */
  variants_products?: Record<string, VariantCombination>
  /** Internal usage, clarifies the variant projected options */
  _variant_hint?: VariantOptionSelection[];
  /** discounts we know were applied to this product */
  discounts?: Record<string, DiscountType>
}

//

// discounts

export type DiscountType = BaseType & {
  /** title */
  title: string;
  /** discount code */
  handle: string;
  /** the order in which to apply the discounts stack (priority) */
  priority: number;
  /** the collection handle that contains the applicable discount products */
  _published: string;
  /** details and filters of the discount */
  info: DiscountInfo;
  /** discount application (automatic and coupons) */
  application: DiscountApplication;
}

/** details and filters of the discount */
export type DiscountInfo = {
  /** discount details */
  details: DiscountDetails;
  /** list of discount filters */
  filters: Filter[]
}

/** Discounts can be manual(coupon) or automatic types, see <a href='#DiscountApplicationEnum'>#DiscountApplicationEnum</a>  */
export type DiscountApplication = {
  /** 0 = Automatic, 1 = Manual */
  id: number;
  /** printable name */
  name: 'Automatic' | 'Manual';
  /** id name */  
  name2: ('automatic' | 'manual');
}

/** Discount filter scheme */
export type Filter = {
  /** meta data related to identifying the filter */
  meta?: FilterMeta;
  /** the filter params */
  value?: string[] | { from?: number, to:number};
}

/** Filter meta data, see <a href='#FilterMetaEnum'>#FilterMetaEnum</a>  */
export type FilterMeta = {
  /** unique identifier for filter type */
  id: number;
  /** product or order filter */
  type: 'product' | 'order';
  /**  operation name id */
  op: 'p-in-collections' | 'p-not-in-collections' | 'p-in-handles' | 'p-not-in-handles' | 'p-in-tags' | 'p-not-in-tags' | 'p-all' | 'p_in_price_range' | 'o-subtotal-in-range' | 'o-items-count-in-range' | 'o-date-in-range' | 'o_has_customer';
  /** printable name */
  name: string;
}

/** The details of how to apply a discount. The type of discount and it's params */
export type DiscountDetails = {
  /** metadata to identify the type of discount */
  meta?: DiscountMeta;
  /** extra parameters of the specific discount type */
  extra: RegularDiscountExtra|OrderDiscountExtra|BulkDiscountExtra|BuyXGetYDiscountExtra|BundleDiscountExtra;
}

/** Discount meta data, see <a href='#DiscountMetaEnum'>#DiscountMetaEnum</a>  */
export type DiscountMeta = {
  /** unique identifier of discount type (bulk, regular, order) */
  id: number;
  /** textual identifier */
  type: 'regular' | 'bulk' | 'buy_x_get_y' | 'order' | 'bundle';
  /** printable name */
  name: string;
}

/** Parameters of a regular discount */
export type RegularDiscountExtra = {
  /** fixed price addition */
  fixed: number
  /** percents off */
  percent: number
}

/** Parameters of order discount */
export type OrderDiscountExtra = {
  /** fixed price addition */
  fixed: number
  /** percents off */
  percent: number
  /** do we have free shipping ? */
  free_shipping?: boolean;
}

/** Parameters of bulk discount */
export type BulkDiscountExtra = {
  /** fixed price addition */
  fixed: number
  /** percents off */
  percent: number
  /** the integer quantity for which the discount is given */
  qty: number
  /** apply the discount as many times as possible */
  recursive?: boolean
}

/** Parameters of bulk discount */
export type BuyXGetYDiscountExtra = {
  /** fixed price addition */
  fixed: number
  /** percents off */
  percent: number
  /** the integer quantity of BUY X */
  qty_x: number
  /** the integer quantity of BUY Y */
  qty_y: number
  /** The filters for what a customer gets (Y) */
  filters_y: Filter[];
  /** apply the discount as many times as possible */
  recursive?: boolean
}

/** Parameters of bulk discount */
export type BundleDiscountExtra = {
  /** fixed price addition */
  fixed: number
  /** percents off */
  percent: number
  /** apply the discount as many times as possible */
  recursive?: boolean
}

// storefront

export type StorefrontData = BaseType & {
  /** readable handle */
  handle: string;
  /** readable title */
  title: string;
  /** video url */
  video?: string;
  /** exported storefront json */
  _published?: string;
  /** Handles of collections part of the storefront */
  collections?: string[];
  /** Handles of products you want to promote as part of the storefront */
  products?: string[];
  /** Handles of shipping methods part of the storefront */
  shipping_methods?: string[];
  /** Handles of discounts to prmote part of the storefront */
  discounts?: string[];
  /** Handles of posts to prmote part of the storefront */
  posts?: string[];
}


//

export type AddressType = {
  /** first name of recipient */
  firstname?: string;
  /** last name of recipient */
  lastname?: string;
  /**
   * The phone number
   * @pattern ^([+]?d{1,2}[-s]?|)d{3}[-s]?d{3}[-s]?d{4}$
   */  
  phone_number?: string;
  /** optional company name of recipient */
  company?: string;
  /** street address 1 */
  street1?: string;
  /** street address 2 */
  street2?: string;
  /** city */
  city?: string;
  /** country */
  country?: string;
  /** state */
  state?: string;
  /** zip code */
  zip_code?: string;
  /** postal code */
  postal_code?: string;  
}

export type CustomerType = BaseType & {
  /** firstname */
  firstname: string;
  /** lastname */
  lastname: string;
  /**
   * @format email
   */
  email: string;
  /**
   * The phone number
   * @pattern ^([+]?d{1,2}[-s]?|)d{3}[-s]?d{3}[-s]?d{4}$
   */  
  phone_number?: string;
  /** address info */
  address?: AddressType;
}

// image

export type ImageType = BaseType & {
  /** storage provider */
  provider?: string;
  /** unique handle */
  handle: string;
  /** name */
  name: string;
  /** it's published public url */
  url: string;
  /** it's api resource location */
  ref: string;
  /** List of assets using this image */
  usage: string[];
}

// shipping


export type ShippingMethodType = BaseType & {
  /**
   * shipping method price
   * @minimum 0
   */
  price: number;
  /** name */
  name: string;
}


// posts

export type PostType = {
  /** unique handle */
  handle: string;
  /** title of post */
  title: string;
  /** rich text of post */
  text: string;
}


// settings



export type SettingsType = BaseType & {

}


// notifications

export type NotificationType = BaseType & {
  /** message of notification, can be markdown, markup or plain text */
  message: string;
  /** author of the notification */
  author?: string;
  /** list of actions */
  actions?: NotificationAction[];
}

/** each notification may have an actionable item associated with it. For example, clicking an order notification will route to the order page at Shelf */
export type NotificationAction = {
  /** Name of the action */
  name: string;
  /** the type of action */
  type: NotificationActionType;
  /** extra params for the actions type */
  params: NotificationActionRouteParams | NotificationActionUrlParams;
}

/** 'route' means routing inside shelfm 'url' is linking to a url */
export type NotificationActionType = 'route' | 'url';

/** route inside shelf action params */
export type NotificationActionRouteParams = {
  /** which collection */
  collection: string;
  /** which document */
  document: string;
}

/** Action params for actions of type 'url' */
export type NotificationActionUrlParams = {
  /** open the url in new window */
  new_window: boolean;
  /** the url to open */
  url: string;
}
