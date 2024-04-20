import { CreateTableBuilder, Kysely } from 'kysely'

/**
 * @typedef {import('../types.sql.tables.js').Database} Database
 */

/**
 * @template {string} TB
 * @template {string} B
 * @param {CreateTableBuilder<TB, B>} tb 
 */
const add_base_columns = tb => {
  return tb
    .addColumn('id', 'text', (col) =>
      col.primaryKey()
    )
    .addColumn('handle', 'text', (col) => col.unique())
    .addColumn('created_at', 'text')
    .addColumn('updated_at', 'text')
    .addColumn('attributes', 'json')
    .addColumn('description', 'text')
    .addColumn('active', 'integer')
}

/**
 * @param {Kysely<Database>} db
 * @param {keyof Database} table_name
 */
const create_entity_to_value_table = (db, table_name) => {
  return db.schema
    .createTable(table_name)
    .addColumn('id', 'integer', 
        (col) => col.autoIncrement().primaryKey()
    )
    .addColumn('entity_id', 'text', col => col.notNull())
    .addColumn('entity_handle', 'text')
    .addColumn('value', 'text')
    .addColumn('reporter', 'text')
    .addColumn('context', 'text')
}

/**
 * 
 * @param {Kysely<Database>} db 
 * @param {keyof Database} table_name 
 */
const create_safe_table = (db, table_name) => {
  return db.schema.createTable(table_name);
}

/**
 * @param {Kysely<Database>} db 
 * @param {keyof Database} table_name 
 */
const drop_safe_table = (db, table_name) => {
  return db.schema.dropTable(table_name).execute();
}

/**
 * @param {Kysely<Database>} db 
 * @param {keyof Database} table_name 
 * @param {boolean} [include_id=true] 
 * @param {boolean} [include_handle=true] 
 */
const create_base_indexes = async (db, table_name, include_id=true, include_handle=true) => {
  if(include_id) {
    await db.schema.createIndex(`index_${table_name}_id_updated_at_asc`)
            .on(table_name)
            .columns(['id', 'updated_at asc'])
            .execute();
    await db.schema.createIndex(`index_${table_name}_id_updated_at_desc`)
            .on(table_name)
            .columns(['id', 'updated_at desc'])
            .execute();
  }

  if(include_handle) {
    await db.schema.createIndex(`index_${table_name}_handle_updated_at_asc`)
            .on(table_name)
            .columns(['handle', 'updated_at asc'])
            .execute();
    await db.schema.createIndex(`index_${table_name}_handle_updated_at_desc`)
            .on(table_name)
            .columns(['handle', 'updated_at desc'])
            .execute();
  }
}


/**
 * @param {Kysely<Database>} db 
 * @param {keyof Pick<Database, 'entity_to_media' | 
 * 'entity_to_search_terms' | 'entity_to_tags_projections' | 
 * 'products_to_collections' | 'products_to_discounts' | 
 * 'products_to_variants' | 'products_to_related_products' | 'storefronts_to_other'>} table_name 
 */
const create_entity_table_indexes = async (db, table_name) => {
  await db.schema.createIndex(`index_${table_name}_entity_id`)
           .on(table_name)
           .column('entity_id')
           .execute();
  await db.schema.createIndex(`index_${table_name}_entity_handle`)
           .on(table_name)
           .column('entity_handle')
           .execute();
  await db.schema.createIndex(`index_${table_name}_value`)
           .on(table_name)
           .column('value')
           .execute();
  await db.schema.createIndex(`index_${table_name}_reporter`)
           .on(table_name)
           .column('reporter')
           .execute();
  await db.schema.createIndex(`index_${table_name}_context`)
           .on(table_name)
           .column('context')
           .execute();
}

/**
 * 
 * @param {Kysely<Database>} db 
 */
export async function up(db) {
  { // auth_users
    let tb = create_safe_table(db, 'auth_users');
    tb = add_base_columns(tb);
    tb = tb
      .addColumn('email', 'text', (col) => col.unique())
      .addColumn('password', 'text')
      .addColumn('roles', 'json')
      .addColumn('confirmed_mail', 'integer');
    await tb.execute();
    await create_base_indexes(db, 'auth_users');
  }

  { // tags
    let tb = create_safe_table(db, 'tags');
    tb = add_base_columns(tb);
    tb = tb.addColumn('values', 'json');
    await tb.execute();
    await create_base_indexes(db, 'tags');
  }

  { // collections
    let tb = create_safe_table(db, 'collections');
    tb = add_base_columns(tb);
    tb = tb
      .addColumn('title', 'text')
      .addColumn('published', 'text')
    await tb.execute();
    await create_base_indexes(db, 'collections');
  }

  { // products
    let tb = create_safe_table(db, 'products');
    tb = add_base_columns(tb);
    tb = tb
      .addColumn('title', 'text')
      .addColumn('video', 'text')
      .addColumn('price', 'numeric')
      .addColumn('isbn', 'text', (col) => col.unique())
      .addColumn('compare_at_price', 'numeric')
      .addColumn('qty', 'integer')
      .addColumn('variants_options', 'json')
      .addColumn('parent_handle', 'text')
      .addColumn('parent_id', 'text')
      .addColumn('variant_hint', 'json')
    await tb.execute();
    await create_base_indexes(db, 'products');
  }

  { // products_to_collections
    await create_entity_to_value_table(db, 'products_to_collections').execute();
    await create_entity_table_indexes(db, 'products_to_collections');
  }

  { // products_to_discounts
    await create_entity_to_value_table(db, 'products_to_discounts').execute();
    await create_entity_table_indexes(db, 'products_to_discounts');
  }
  
  { // products_to_variants
    await create_entity_to_value_table(db, 'products_to_variants').execute();
    await create_entity_table_indexes(db, 'products_to_variants');
  }

  { // products_to_related_products
    await create_entity_to_value_table(db, 'products_to_related_products').execute();
    await create_entity_table_indexes(db, 'products_to_related_products');
  }

  { // shipping_methods
    let tb = create_safe_table(db, 'shipping_methods');
    tb = add_base_columns(tb);
    tb = tb.addColumn('title', 'text')
      .addColumn('price', 'numeric')
    await tb.execute();
    await create_base_indexes(db, 'shipping_methods');
  }

  { // posts
    let tb = create_safe_table(db, 'posts');
    tb = add_base_columns(tb);
    tb = tb
      .addColumn('title', 'text')
      .addColumn('text', 'text')
    await tb.execute();
    await create_base_indexes(db, 'posts');
  }

  { // customers
    let tb = create_safe_table(db, 'customers');
    tb = add_base_columns(tb);
    tb = tb
      .addColumn('email', 'text', (col) => col.unique())
      .addColumn('auth_id', 'text', (col) => col.unique())
      .addColumn('firstname', 'text')
      .addColumn('lastname', 'text')
      .addColumn('phone_number', 'text')
      .addColumn('address', 'json')
    await tb.execute();
    await create_base_indexes(db, 'customers');
  }

  { // orders
    let tb = create_safe_table(db, 'orders');
    tb = add_base_columns(tb);
    tb = tb
      .addColumn('contact', 'json')
      .addColumn('address', 'json')
      .addColumn('line_items', 'json')
      .addColumn('notes', 'text')
      .addColumn('shipping_method', 'json')
      .addColumn('status', 'json')
      .addColumn('pricing', 'json')
      .addColumn('validation', 'json')
      .addColumn('payment_gateway', 'json')
      .addColumn('coupons', 'json')
      .addColumn('_customer_id', 'text')
      .addColumn('_status_payment_id', 'integer')
      .addColumn('_status_checkout_id', 'integer')
      .addColumn('_status_fulfillment_id', 'integer')
    
    await tb.execute();
    await create_base_indexes(db, 'orders');
  }

  { // storefronts
    let tb = create_safe_table(db, 'storefronts');
    tb = add_base_columns(tb);
    tb = tb
      .addColumn('title', 'text')
      .addColumn('video', 'text')
      .addColumn('published', 'text')
    await tb.execute();
    await create_base_indexes(db, 'storefronts');
  }

  { // storefronts_to_other
    await create_entity_to_value_table(db, 'storefronts_to_other').execute();
    await create_entity_table_indexes(db, 'storefronts_to_other');
  }

  { // notifications
    let tb = create_safe_table(db, 'notifications');
    tb = add_base_columns(tb);
    tb = tb
      .addColumn('message', 'text')
      .addColumn('author', 'text')
      .addColumn('actions', 'json')
      // .addColumn('search', 'json')
    await tb.execute();
    await create_base_indexes(db, 'notifications', true, false);
  } 

  { // images
    let tb = create_safe_table(db, 'images');
    tb = add_base_columns(tb);
    tb = tb
      .addColumn('name', 'text')
      .addColumn('url', 'text')
    await tb.execute();
    await create_base_indexes(db, 'images');
  } 

  { // discounts
    let tb = create_safe_table(db, 'discounts');
    tb = add_base_columns(tb);
    tb = tb
      .addColumn('title', 'text')
      .addColumn('published', 'text')
      .addColumn('priority', 'integer')
      .addColumn('info', 'json')
      .addColumn('application', 'json')
      .addColumn('_application_id', 'integer')
      .addColumn('_discount_type_id', 'integer')
    await tb.execute();
    await create_base_indexes(db, 'discounts');
  } 

  { // entity_to_tags_projections
    await create_entity_to_value_table(db, 'entity_to_tags_projections').execute();
    await create_entity_table_indexes(db, 'entity_to_tags_projections');
  }

  { // entity_to_search_terms
    await create_entity_to_value_table(db, 'entity_to_search_terms').execute();
    await create_entity_table_indexes(db, 'entity_to_search_terms');
  }

  { // entity_to_media
    await create_entity_to_value_table(db, 'entity_to_media').execute();
    await create_entity_table_indexes(db, 'entity_to_media');
  }

}

/**
 * 
 * @param {Kysely<Database>} db 
 */
export async function down(db) {
  await Promise.all([
    drop_safe_table(db, 'auth_users'),
    drop_safe_table(db, 'tags'),
    drop_safe_table(db, 'collections'),
    drop_safe_table(db, 'customers'),
    drop_safe_table(db, 'discounts'),
    drop_safe_table(db, 'images'),
    drop_safe_table(db, 'notifications'),
    drop_safe_table(db, 'orders'),
    drop_safe_table(db, 'posts'),
    drop_safe_table(db, 'shipping_methods'),
    drop_safe_table(db, 'products'),
    drop_safe_table(db, 'products_to_collections'),
    drop_safe_table(db, 'products_to_discounts'),
    drop_safe_table(db, 'products_to_variants'),
    drop_safe_table(db, 'storefronts'),
    drop_safe_table(db, 'storefronts_to_other'),
    drop_safe_table(db, 'entity_to_media'),
    drop_safe_table(db, 'entity_to_search_terms'),
    drop_safe_table(db, 'entity_to_tags_projections'),
  ]);
}