import { AttributeType, AuthUserType, Role, TagType, 
  CollectionType, ProductType, ShippingMethodType,
  VariantOption, PostType, CustomerType,
  VariantOptionSelection,
  AddressType} from '@storecraft/core'
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
  handle: string;
  values: JSONColumnType<string[]>;
}

export interface CollectionsTable extends Base {
  handle: string;
  title: string;
  published: string | undefined;
}

export interface ProductsTable extends Base {
  handle: string;
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
  handle: string;
  title: string;
  price: number;
}

export interface PostsTable extends Base {
  handle: string;
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
