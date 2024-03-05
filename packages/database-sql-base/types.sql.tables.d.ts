import { AttributeType, AuthUserType, Role, TagType, 
  CollectionType, ProductType, ShippingMethodType,
  VariantOption, PostType, CustomerType,
  VariantOptionSelection, OrderData, StorefrontType,
  AddressType, ImageType,
  OrderContact,
  LineItem,
  OrderStatus, DiscountType,
  PricingData,
  ValidationEntry,
  OrderPaymentGatewayData, NotificationType,
  NotificationAction,
  DiscountInfo,
  DiscountApplication} from '@storecraft/core'
import {
  ColumnType,
  Generated,
  Insertable,
  JSONColumnType,
  Selectable,
  Updateable
} from 'kysely'

export interface Database {
  auth_users: AuthUserTypeTable,
  tags: TagsTable
  collections: CollectionsTable,
  shipping_methods: ShippingMethodsTable;
  posts: PostsTable;
  customers: CustomersTable;
  orders: OrdersTable;
  storefronts: StorefrontType;
  notifications: NotificationsTable;
  images: ImagesTable;
  discounts: DiscountsTable;

  products: ProductsTable,
  products_to_collections: products_to_collections;
  products_to_discounts: products_to_discounts;

  entity_to_media: entity_to_media,
  entity_to_tags_projections: entity_to_tags_projections,
  entity_to_search_terms: entity_to_search_terms,
}

export interface entity_to_value {
  id: Generated<number>,
  entity_id: string,
  entity_handle: string,
  value: string
  /** reporter is a segmentation technique, it adds another dimension.
   *  If reporter is `null`, then it means the `entity_id` was the reporter */
  reporter: string | undefined;
}

export interface entity_to_media extends entity_to_value {}
export interface entity_to_tags_projections extends entity_to_value {}
export interface entity_to_search_terms extends entity_to_value {}
export interface products_to_collections extends entity_to_value {}
export interface products_to_discounts extends entity_to_value {}

export interface Base {
  attributes: JSONColumnType<AttributeType[] | undefined>;
  description: ColumnType<string | undefined>;
  active: ColumnType<boolean | undefined>;
  created_at: ColumnType<string>;
  updated_at: ColumnType<string>;
  id: string;
  handle: string;
}

export interface AuthUserTypeTable extends Base {
  email: string;
  password: string;
  confirmed_mail: boolean
  roles: JSONColumnType<Role[]>;
}

export type AuthUserTypeSelect = Selectable<AuthUserTypeTable>
export type AuthUserTypeInsert = Insertable<AuthUserTypeTable>
export type AuthUserTypeUpdate = Updateable<AuthUserTypeTable>

export interface TagsTable extends Base {
  values: JSONColumnType<string[]>;
}

export interface CollectionsTable extends Base {
  title: string;
  published: string | undefined;
}

export interface ProductsTable extends Base {
  title: string;
  video: string;
  price: number;
  qty: number;
  compare_at_price: number;
  variants_options: JSONColumnType<VariantOption[]>;
  //for variant children
  parent_handle: string;
  parent_id: string;
  variant_hint: JSONColumnType<VariantOptionSelection[]>;
}

export interface ShippingMethodsTable extends Base {
  title: string;
  price: number;
}

export interface PostsTable extends Base {
  title: string;
  text: string;
}

export interface CustomersTable extends Base {
  auth_id: string;
  firstname: string;
  lastname: string;
  email: string;
  phone_number: string;
  address: JSONColumnType<AddressType>;
}

export interface OrdersTable extends Base {
  /** buyer info */
  contact: JSONColumnType<OrderContact>;
  /** shipping address info */
  address: JSONColumnType<AddressType>;
  /** line items is a list of the purchased products */
  line_items: JSONColumnType<LineItem[]>;
  /** notes for the order */
  notes: string; 
  /** shipping method info */
  shipping_method: JSONColumnType<ShippingMethodType>; 
  /** status of checkout, fulfillment and payment */
  status: JSONColumnType<OrderStatus>; 
  /** pricing information */
  pricing: JSONColumnType<PricingData>;
  /** in case the order went through validation  */
  validation: JSONColumnType<ValidationEntry[]>;
  /** payment gateway info and status */
  payment_gateway: JSONColumnType<OrderPaymentGatewayData>; 
  /** a list of manual coupons snapshots that were used */
  coupons: JSONColumnType<DiscountType[]>; 
}

export interface StorefrontsTable extends Base {
  /** readable title */
  title: string;
  /** video url */
  video: string;
  /** exported storefront json */
  published: string;
}

export interface NotificationsTable extends Base {
  /** message of notification, can be markdown, markup or plain text */
  message: string;
  /** author of the notification */
  author: string;
  /** list of actions */
  actions: JSONColumnType<NotificationAction[]>;
  // for local usage as well
  search: JSONColumnType<string[]>; 
}

export interface ImagesTable extends Base {
  name: string;
  url: string;
}

export interface DiscountsTable extends Base {
  /** title */
  title: string;
  /** discount code */
  handle: string;
  priority: number;
  /** the collection handle that contains the applicable discount products */
  published?: string;
  /** details and filters of the discount */
  info: JSONColumnType<DiscountInfo>;
  /** discount application (automatic and coupons) */
  application: JSONColumnType<DiscountApplication>;
}

