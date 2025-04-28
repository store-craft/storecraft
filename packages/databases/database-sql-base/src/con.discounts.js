/**
 * @import { db_discounts as db_col } from '@storecraft/core/database'
 */
import { enums } from '@storecraft/core/api'
import { 
  helper_compute_product_extra_search_keywords_because_of_discount_side_effect_for_db,
  helper_compute_product_extra_tags_because_of_discount_side_effect_for_db
 } from '@storecraft/core/database'
import { SQL } from '../index.js'
import { discount_to_conjunctions, is_order_discount } from './con.discounts.utils.js'
import { 
  delete_entity_values_by_value_or_reporter_and_context, 
  delete_me, delete_media_of, delete_search_of, 
  delete_tags_of, insert_media_of, insert_search_of, 
  insert_tags_of, regular_upsert_me, where_id_or_handle_table, 
  with_media, with_tags, count_regular, with_search,
} from './con.shared.js'
import { sanitize, sanitize_array } from './utils.funcs.js'
import { query_to_eb, withQuery, withSort } from './utils.query.js'
import { report_document_media } from './con.images.js'

export const table_name = 'discounts'

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
          /// ENTITIES
          await insert_search_of(trx, search_terms, item.id, item.handle, table_name);
          await insert_media_of(trx, item.media, item.id, item.handle, table_name);
          await insert_tags_of(trx, item.tags, item.id, item.handle, table_name);
          await report_document_media(driver)(item, trx);
          //
          // PRODUCTS => DISCOUNTS
          //
          // remove all products relation to this discount
          await delete_entity_values_by_value_or_reporter_and_context('products_to_discounts')(
            trx, item.id, item.handle);
          
          const extra_search_for_products = 
            helper_compute_product_extra_search_keywords_because_of_discount_side_effect_for_db(item);

          const extra_tags_for_products = 
            helper_compute_product_extra_tags_because_of_discount_side_effect_for_db(item);
          
            // maybe i should confine these to `context`=`products`
          for(const extra_search of extra_search_for_products) {
            await delete_entity_values_by_value_or_reporter_and_context('entity_to_search_terms')(
              trx, extra_search);
          }
          for(const extra_tag of extra_tags_for_products) {
            await delete_entity_values_by_value_or_reporter_and_context('entity_to_tags_projections')(
              trx, extra_tag);
          }
  
          // make connections into `products_to_discounts`, only applicable for
          // `product` discounts and automatic discounts
          if(
            item.active && 
            item.application.id===enums.DiscountApplicationEnum.Auto.id &&
            !is_order_discount(item)
          ) {
            // make connections
            await trx
            .insertInto('products_to_discounts')
            .columns(['entity_handle', 'entity_id', 'value', 'reporter'])
            .expression(eb => 
              eb.selectFrom('products')
                .select(eb => [
                    'handle as entity_handle',
                    'id as entity_id',
                    eb.val(item.id).as('value'),
                    eb.val(item.handle).as('reporter')
                  ]
                )
                .where(
                  eb => eb.and(discount_to_conjunctions(eb, item))
                )
            ).execute();

            for(const extra_search of extra_search_for_products) {
              await trx
              .insertInto('entity_to_search_terms')
              .columns(['entity_handle', 'entity_id', 'value', 'reporter', 'context'])
              .expression(eb => 
                eb.selectFrom('products')
                  .select(eb => [
                      'handle as entity_handle',
                      'id as entity_id',
                      eb.val(extra_search).as('value'),
                      eb.val(item.id).as('reporter'),
                      eb.val('products').as('context'),
                    ]
                  )
                  .where(
                    eb => eb.and(discount_to_conjunctions(eb, item))
                  )
              ).execute();      
            }
            for(const extra_tag of extra_tags_for_products) {
              await trx
              .insertInto('entity_to_tags_projections')
              .columns(['entity_handle', 'entity_id', 'value', 'reporter', 'context'])
              .expression(eb => 
                eb.selectFrom('products')
                  .select(eb => [
                      'handle as entity_handle',
                      'id as entity_id',
                      eb.val(extra_tag).as('value'),
                      eb.val(item.id).as('reporter'),
                      eb.val('products').as('context'),
                    ]
                  )
                  .where(
                    eb => eb.and(discount_to_conjunctions(eb, item))
                  )
              ).execute();  
            }                    
          }

          ///
          /// SAVE ME
          ///
          await regular_upsert_me(trx, table_name, {
            active: item.active ? 1 : 0,
            attributes: JSON.stringify(item.attributes),
            description: item.description,
            created_at: item.created_at,
            updated_at: item.updated_at,
            id: item.id,
            handle: item.handle,
            title: item.title, 
            priority: item.priority ?? 0,
            published: item.published,
            application: JSON.stringify(item.application),
            info: JSON.stringify(item.info),
            _application_id: item.application.id,
            _discount_type_id: item?.info?.details?.meta?.id ?? -1,
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
  return (id_or_handle, options) => {
    return driver.client
      .selectFrom(table_name)
      .selectAll()
      .select(eb => [
        with_media(eb, id_or_handle, driver.dialectType),
        with_tags(eb, id_or_handle, driver.dialectType),
        with_search(eb, id_or_handle, driver.dialectType),
      ].filter(Boolean))
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
          // delete products -> discounts
          // PRODUCTS => DISCOUNTS
          await delete_entity_values_by_value_or_reporter_and_context('products_to_discounts')(
            trx, id_or_handle, id_or_handle);
          // STOREFRONT => DISCOUNTS
          await delete_entity_values_by_value_or_reporter_and_context('storefronts_to_other')(
            trx, id_or_handle, id_or_handle, table_name
          );
          // discount might have published search terms and tags for other products, 
          // so let's remove
          const discount_handle_and_id = await trx
          .selectFrom('discounts')
          .select(['handle', 'id'])
          .where(
            (eb) => eb.or([
              eb('discounts.handle', '=', id_or_handle),
              eb('discounts.id', '=', id_or_handle)
            ])
          )
          .executeTakeFirst();

          const extra_search_for_products = 
            helper_compute_product_extra_search_keywords_because_of_discount_side_effect_for_db(
              discount_handle_and_id
            );

          const extra_tags_for_products = 
            helper_compute_product_extra_tags_because_of_discount_side_effect_for_db(
              discount_handle_and_id
            );

          for(const extra_search of extra_search_for_products) {
            await delete_entity_values_by_value_or_reporter_and_context('entity_to_search_terms')(
              trx, extra_search);
          }
          for(const extra_tag of extra_tags_for_products) {
            await delete_entity_values_by_value_or_reporter_and_context('entity_to_tags_projections')(
              trx, extra_tag);
          } 

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
  return async (query) => {

    const items = await withQuery(
      driver.client
      .selectFrom(table_name)
      .selectAll()
      .select(eb => [
        with_media(eb, eb.ref('discounts.id'), driver.dialectType),
        with_tags(eb, eb.ref('discounts.id'), driver.dialectType),
        with_search(eb, eb.ref('discounts.id'), driver.dialectType),
      ].filter(Boolean)),
      query, table_name
    ).execute();

      // .orderBy(query_to_sort(query, table_name))
      // .limit(query.limitToLast ?? query.limit ?? 10)
      // .execute();

    if(query.limitToLast) 
      items.reverse();

    return sanitize_array(items);
  }
}

/**
 * @param {SQL} driver 
 * @returns {db_col["list_discount_products"]}
 */
const list_discount_products = (driver) => {
  return async (handle_or_id, query={}) => {

    const items = await withSort(
      driver.client
      .selectFrom('products')
      .innerJoin(
        'products_to_discounts', 
        'products_to_discounts.entity_id', 
        'products.id'
      )
      .selectAll('products')
      .select(eb => [
        with_media(eb, eb.ref('products.id'), driver.dialectType),
        with_tags(eb, eb.ref('products.id'), driver.dialectType),
      ])
      .where(
        (eb) => eb.and(
          [
            query_to_eb(eb, query, 'products'),
            eb.or(
              [
                eb('products_to_discounts.reporter', '=', handle_or_id),
                eb('products_to_discounts.value', '=', handle_or_id)
              ]
            )
          ].filter(Boolean)        
        )
      )
      .limit(query.limitToLast ?? query.limit ?? 10),
      query, 'products'
    ).execute();

      // .orderBy(query_to_sort(query, 'products'))
      // .execute();

    if(query.limitToLast) 
      items.reverse();

    return sanitize_array(items);
  }
}



/**
 * @param {SQL} driver 
 * @returns {db_col["list_all_discount_products_tags"]}
 */
const list_all_discount_products_tags = (driver) => {
  return async (handle_or_id) => {

    const items = await driver.client
      .selectFrom('products')
      .innerJoin(
        'products_to_discounts', 
        'products_to_discounts.entity_id', 
        'products.id'
      )
      .innerJoin(
        'entity_to_tags_projections', 
        'entity_to_tags_projections.entity_id', 
        'products.id'
      )
      .select('entity_to_tags_projections.value as tag')
      .where(
        (eb) => eb.or(
          [
            eb('products_to_discounts.reporter', '=', handle_or_id),
            eb('products_to_discounts.value', '=', handle_or_id)
          ]
        )
      )
      .groupBy('tag')
      .execute();

      // .compile();
      // console.log(items[0])

    return items.map(e => e.tag);
  }
}


/**
 * @param {SQL} driver 
 * @returns {db_col["count_discount_products"]}
 */
const count_discount_products = (driver) => {
  return async (handle_or_id, query={}) => {

    const result = await driver.client
      .selectFrom('products')
      .innerJoin(
        'products_to_discounts', 
        'products_to_discounts.entity_id', 
        'products.id'
      )
      .select(
        (eb) => eb.fn.countAll().as('count')
      )
      .where(
        (eb) => eb.and(
          [
            query_to_eb(eb, query, 'products'),
            eb.or(
              [
                eb('products_to_discounts.reporter', '=', handle_or_id),
                eb('products_to_discounts.value', '=', handle_or_id)
              ]
            )
          ].filter(Boolean)        
        )
      )
      .executeTakeFirst();

    return Number(result.count);
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
    list_discount_products: list_discount_products(driver),
    count_discount_products: count_discount_products(driver),
    list_all_discount_products_tags: list_all_discount_products_tags(driver),
    count: count_regular(driver, table_name),
  }
}
