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
  return tb.addColumn('id', 'text', (col) =>
    col.primaryKey()
  ).addColumn('created_at', 'text')
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
  return db.schema.createTable(table_name)
                  .addColumn('id', 'integer', 
                      (col) => col.autoIncrement().primaryKey()
                  )
                  .addColumn('entity_id', 'text', col => col.notNull())
                  .addColumn('entity_handle', 'text')
                  .addColumn('value', 'text')
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
 * 
 * @param {Kysely<Database>} db 
 * @param {keyof Database} table_name 
 */
const drop_safe_table = (db, table_name) => {
  return db.schema.dropTable(table_name).execute();
}

/**
 * 
 * @param {Kysely<Database>} db 
 */
export async function up(db) {
  { // auth_users
    let tb = create_safe_table(db, 'auth_users');
    tb = add_base_columns(tb);
    tb = tb.addColumn('email', 'text', (col) => col.unique())
      .addColumn('password', 'text')
      .addColumn('roles', 'json')
      .addColumn('confirmed_mail', 'integer');
    await tb.execute();
  }

  { // tags
    let tb = create_safe_table(db, 'tags');
    tb = add_base_columns(tb);
    tb = tb.addColumn('handle', 'text', (col) => col.unique())
      .addColumn('values', 'json');
    await tb.execute();
  }

  { // collections
    let tb = create_safe_table(db, 'collections');
    tb = add_base_columns(tb);
    tb = tb.addColumn('handle', 'text', (col) => col.unique())
      .addColumn('title', 'text')
      .addColumn('published', 'text')
    await tb.execute();
  }

  { // products
    let tb = create_safe_table(db, 'products');
    tb = add_base_columns(tb);
    tb = tb.addColumn('handle', 'text', (col) => col.unique())
      .addColumn('title', 'text')
      .addColumn('video', 'text')
      .addColumn('price', 'numeric')
      .addColumn('qty', 'integer')
      .addColumn('compare_at_price', 'integer')
      .addColumn('variants_options', 'json')
      .addColumn('parent_handle', 'text')
      .addColumn('parent_id', 'text')
      .addColumn('variant_hint', 'json')
    await tb.execute();
  }

  { // entity_to_tags_projections
    let tb = create_entity_to_value_table(db, 'entity_to_tags_projections')
    await tb.execute();
  }

  { // entity_to_search_terms
    let tb = create_entity_to_value_table(db, 'entity_to_search_terms')
    await tb.execute();
  }

  { // entity_to_media
    let tb = create_entity_to_value_table(db, 'entity_to_media')
    await tb.execute();
  }

  { // products_to_collections
    let tb = create_entity_to_value_table(db, 'products_to_collections')
    await tb.execute();
  }

  { // products_to_discounts
    let tb = create_entity_to_value_table(db, 'products_to_discounts')
    await tb.execute();
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
    drop_safe_table(db, 'entity_to_media'),
    drop_safe_table(db, 'entity_to_search_terms'),
    drop_safe_table(db, 'entity_to_tags_projections'),
  ]);
}