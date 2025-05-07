/**
 * @import { db_storefronts as db_col } from '@storecraft/core/database'
 * @import { Database } from '../types.sql.tables.js';
 */
import { SQL } from '../index.js'
import { jsonArrayFrom, stringArrayFrom } from './con.helpers.json.js'
import { report_document_media } from './con.images.js'
import { delete_entity_values_of_by_entity_id_or_handle_and_context, 
  delete_me, delete_media_of, delete_search_of, 
  delete_tags_of, insert_entity_values_of, insert_media_of, 
  insert_search_of, insert_tags_of, storefront_with_collections, 
  storefront_with_discounts, storefront_with_posts, 
  storefront_with_products, storefront_with_shipping, 
  regular_upsert_me, where_id_or_handle_table, 
  with_media, with_tags, 
  count_regular,
  with_search,
  products_with_collections,
  products_with_discounts,
  products_with_variants,
  products_with_related_products} from './con.shared.js'
import { sanitize, sanitize_array } from './utils.funcs.js'
import { withQuery } from './utils.query.js'

export const table_name = 'storefronts'

/**
 * @param {SQL} driver 
 * @returns {db_col["upsert"]}
 */
const upsert = (driver) => {
  return async (item, search_terms) => {
    const c = driver.client;
    try {
      const t = await c.transaction().execute(
        async (trx) => {
          // regular entities
          await insert_search_of(trx, search_terms, item.id, item.handle, table_name);
          await insert_media_of(trx, item.media, item.id, item.handle, table_name);
          await insert_tags_of(trx, item.tags, item.id, item.handle, table_name);
          await report_document_media(driver)(item, trx);
          // Explicit STOREFRONTS => PRODUCTS / COLLECTIONS / DISCOUNTS / SHIPPING / POSTS
          // remove all the past connections of this storefront at once
          await delete_entity_values_of_by_entity_id_or_handle_and_context('storefronts_to_other')(
            trx, item.id
          );
          if(item.collections) { // add this storefront's new collections connections
            await insert_entity_values_of('storefronts_to_other')(
              trx, item.collections.map(c => ({ value: c.id, reporter: c.handle})), 
              item.id, item.handle, 'collections'
            );
          }
          if(item.products) { // add this storefront's new products connections
            await insert_entity_values_of('storefronts_to_other')(
              trx, item.products.map(c => ({ value: c.id, reporter: c.handle})), 
              item.id, item.handle, 'products'
            );
          }
          if(item.discounts) { // add this storefront's new discounts connections
            await insert_entity_values_of('storefronts_to_other')(
              trx, item.discounts.map(c => ({ value: c.id, reporter: c.handle})), 
              item.id, item.handle, 'discounts'
            );
          }
          if(item.posts) { // add this storefront's new posts connections
            await insert_entity_values_of('storefronts_to_other')(
              trx, item.posts.map(c => ({ value: c.id, reporter: c.handle})), 
              item.id, item.handle, 'posts'
            );
          }
          if(item.shipping_methods) { // add this storefront's new shipping_methods connections
            await insert_entity_values_of('storefronts_to_other')(
              trx, item.shipping_methods.map(c => ({ value: c.id, reporter: c.handle})), 
              item.id, item.handle, 'shipping_methods'
            );
          }

          // upsert me
          await regular_upsert_me(trx, table_name, {
            active: item.active ? 1 : 0,
            attributes: JSON.stringify(item.attributes),
            description: item.description,
            created_at: item.created_at,
            updated_at: item.updated_at,
            id: item.id,
            handle: item.handle,
            published: item.published, 
            title: item.title,
            video: item.video,
          });
        }
      );
    } catch(e) {
      console.log(e);
      return false;
    }
    return true;
  }
}


/**
 * @param {SQL} driver 
 * @returns {db_col["get"]}
 */
const get = (driver) => {
  // @ts-ignore
  return (id_or_handle, options) => {
    const expand = options?.expand ?? ['*'];
    const expand_all = expand.includes('*');
    const expand_collections = expand_all || expand.includes('collections');
    const expand_products = expand_all || expand.includes('products');
    const expand_discounts = expand_all || expand.includes('discounts');
    const expand_shipping = expand_all || expand.includes('shipping_methods');
    const expand_posts = expand_all || expand.includes('posts');

    return driver.client
    .selectFrom(table_name)
    .selectAll()
    .select(eb => [
      with_media(eb, id_or_handle, driver.dialectType),
      with_tags(eb, id_or_handle, driver.dialectType),
      with_search(eb, id_or_handle, driver.dialectType),
      expand_collections && storefront_with_collections(
        eb, id_or_handle, driver.dialectType
      ),
      expand_products && storefront_with_products(
        eb, id_or_handle, driver.dialectType
      ),
      expand_discounts && storefront_with_discounts(
        eb, id_or_handle, driver.dialectType
      ),
      expand_shipping && storefront_with_shipping(
        eb, id_or_handle, driver.dialectType
      ),
      expand_posts && storefront_with_posts(
        eb, id_or_handle, driver.dialectType
      ),
    ]
    .filter(Boolean))
    .where(where_id_or_handle_table(id_or_handle))
    .executeTakeFirst()
    .then(sanitize);
  }
}


/**
 * @param {SQL} driver 
 * @returns {db_col["remove"]}
 */
const remove = (driver) => {
  return async (id_or_handle) => {
    try {
      await driver.client.transaction().execute(
        async (trx) => {
            
          // entities
          await delete_tags_of(trx, id_or_handle, id_or_handle, table_name);
          await delete_search_of(trx, id_or_handle, id_or_handle, table_name);
          await delete_media_of(trx, id_or_handle, id_or_handle, table_name);
          // delete storefront => other
          // this is correct, since `id` or `handle` are both unique for this table
          await delete_entity_values_of_by_entity_id_or_handle_and_context('storefronts_to_other')(
            trx, id_or_handle, id_or_handle
          );
          // delete me
          await delete_me(trx, table_name, id_or_handle);
        }
      );

    } catch(e) {
      console.log(e);
      return false;
    }
    return true;
  }
}


/**
 * @param {SQL} driver 
 * @returns {db_col["list"]}
 */
const list = (driver) => {
  // @ts-ignore
  return async (query) => {
    const expand = query?.expand ?? ['*'];
    const expand_all = expand.includes('*');
    const expand_collections = expand_all || expand.includes('collections');
    const expand_products = expand_all || expand.includes('products');
    const expand_discounts = expand_all || expand.includes('discounts');
    const expand_shipping = expand_all || expand.includes('shipping_methods');
    const expand_posts = expand_all || expand.includes('posts');

    const items = await withQuery(
      driver.client
      .selectFrom(table_name)
      .selectAll()
      .select(eb => [
          with_media(eb, eb.ref('storefronts.id'), driver.dialectType),
          with_tags(eb, eb.ref('storefronts.id'), driver.dialectType),
          with_search(eb, eb.ref('storefronts.id'), driver.dialectType),
          expand_collections && storefront_with_collections(
            eb, eb.ref('storefronts.id'), driver.dialectType
          ),
          expand_products && storefront_with_products(
            eb, eb.ref('storefronts.id'), driver.dialectType
          ),
          expand_discounts && storefront_with_discounts(
            eb, eb.ref('storefronts.id'), driver.dialectType
          ),
          expand_shipping && storefront_with_shipping(
            eb, eb.ref('storefronts.id'), driver.dialectType
          ),
          expand_posts && storefront_with_posts(
            eb, eb.ref('storefronts.id'), driver.dialectType
          ),
        ].filter(Boolean)
      ),
      query, table_name
    ).execute();

    if(query.limitToLast) 
      items.reverse();

    return sanitize_array(items);
  }
}

/**
 * @type {{[K in keyof Database]?: (keyof Database[K])[]}}
 */
const resource_to_props = (
  {
    'collections': ['active', 'attributes', 'created_at', 'description', 'handle', 'id', 'published', 'title', 'updated_at'],
    'discounts': ['active', 'application', 'attributes', 'created_at', 'description', 'handle', 'id', 'info', 'priority', 'published', 'title', 'updated_at'],
    'products': ['active', 'attributes', 'compare_at_price', 'created_at', 'description', 'handle', 'id', 'isbn', 'parent_handle', 'parent_id', 'price', 'qty', 'title', 'updated_at', 'variant_hint', 'variants_options', 'video'],
    'shipping_methods': ['active', 'attributes', 'created_at', 'description', 'handle', 'id', 'price', 'title', 'updated_at'],
    'posts': ['active', 'attributes', 'created_at', 'description', 'handle', 'id', 'text', 'title', 'updated_at'],
  }
);


/**
 * @param {SQL} driver 
 * @returns {db_col["get_default_auto_generated_storefront"]}
 */
const get_default_auto_generated_storefront = (driver) => {
  return async () => {
    const client = driver.client;
    const dialectType = driver.dialectType;
    const limit = -1;
    const sf = await client.selectNoFrom(
      eb => [
        jsonArrayFrom(
          eb
          .selectFrom('collections')
          .select(resource_to_props.collections)
          .select(
            eb => [
              with_tags(eb, eb.ref('collections.id'), dialectType),
              with_media(eb, eb.ref('collections.id'), dialectType),
            ]
          )
          .where('active', '=', 1)
          .orderBy('updated_at', 'desc'),
          driver.dialectType
        ).as('collections'),
  
        jsonArrayFrom(
          eb
          .selectFrom('products')
          .select(resource_to_props.products)
          .select(
            eb => [
              with_tags(eb, eb.ref('products.id'), dialectType),
              with_media(eb, eb.ref('products.id'), dialectType),
              products_with_collections(eb, eb.ref('products.id'), dialectType),
              products_with_discounts(eb, eb.ref('products.id'), dialectType),
              products_with_variants(eb, eb.ref('products.id'), dialectType),
              products_with_related_products(eb, eb.ref('products.id'), dialectType),
            ]
          )
          .where('active', '=', 1)
          .orderBy('updated_at', 'desc')
          .limit(10),
          dialectType
        ).as('products'),
  
        jsonArrayFrom(
          eb
          .selectFrom('discounts')
          .select(resource_to_props.discounts)
          .select(
            eb => [
              with_tags(eb, eb.ref('discounts.id'), dialectType),
              with_media(eb, eb.ref('discounts.id'), dialectType),
            ]
          )
          .where('active', '=', 1)
          .orderBy('updated_at', 'desc'),
          dialectType
        ).as('discounts'),
  
        jsonArrayFrom(
          eb
          .selectFrom('shipping_methods')
          .select(resource_to_props.shipping_methods)
          .select(
            eb => [
              with_tags(eb, eb.ref('shipping_methods.id'), dialectType),
              with_media(eb, eb.ref('shipping_methods.id'), dialectType),
            ]
          )
          .where('active', '=', 1)
          .orderBy('updated_at', 'desc'),
          dialectType
        ).as('shipping_methods'),
  
        jsonArrayFrom(
          eb
          .selectFrom('posts')
          .select(resource_to_props.posts)
          .select(
            eb => [
              with_tags(eb, eb.ref('posts.id'), dialectType),
              with_media(eb, eb.ref('posts.id'), dialectType),
            ]
          )
          .where('active', '=', 1)
          .orderBy('updated_at', 'desc')
          .limit(3),
          dialectType
        ).as('posts'),
  
        stringArrayFrom(
          eb
          .selectFrom('products')
          .innerJoin(
            'entity_to_tags_projections', 
            'entity_to_tags_projections.entity_id', 
            'products.id'
          )
          .select('entity_to_tags_projections.value as tag')
          .groupBy('tag'),
          dialectType
        ).as('all_used_products_tags')
      ]
    )
    .executeTakeFirst();
  
    const sanitized = sanitize(
      {
        active: true,
        created_at: new Date().toISOString(),
        handle: 'default-auto-generated-storefront',
        id: 'default',
        title: 'Default Auto Generated Storefront',
        description: 'Default Auto Generated Storefront',
        ...sf
      }
    );

    return sanitized;
  }
}

/** 
 * @param {SQL} driver
 * @return {db_col}}
 * */
export const impl = (driver) => {

  return {
    get: get(driver),
    upsert: upsert(driver),
    remove: remove(driver),
    list: list(driver),
    count: count_regular(driver, table_name),
    get_default_auto_generated_storefront: get_default_auto_generated_storefront(driver),
  }
}

