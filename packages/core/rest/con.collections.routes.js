/** 
 * @import { ApiPolka } from './types.public.js' 
 * @import { ApiQuery } from '../api/types.api.query.js' 
 * @import { CollectionType, ProductType, VariantType } from '../api/types.api.js' 
 */
import { Polka } from './polka/index.js'
import { assert } from '../api/utils.func.js'
import { authorize_by_roles } from './con.auth.middle.js'
import { parse_query } from '../api/utils.query.js'
import { App } from '../index.js'

/**
 * 
 * @param {App} app
 */
export const create_routes = (app) => {

  /** @type {ApiPolka} */
  const polka = new Polka();

  const middle_authorize_admin = authorize_by_roles(app, ['admin'])

  // save tag 
  polka.post(
    '/',
    middle_authorize_admin,
    async (req, res) => {
      const final = await app.api.collections.upsert(req.parsedBody);
      res.sendJson(final);
    }
  )

  polka.get(
    '/count_query',
    async (req, res) => {
      const q = (/** @type {ApiQuery<CollectionType>} */ (
        parse_query(req.query))
      );
      const count = await app.api.collections.count(q);
      res.sendJson({ count });
    }
  );

  // get item
  polka.get(
    '/:handle',
    async (req, res) => {
      const handle_or_id = req?.params?.handle;
      const item = await app.api.collections.get(handle_or_id);

      assert(item, 'not-found', 404);

      res.sendJson(item);
    }
  );

  // delete item
  polka.delete(
    '/:handle',
    middle_authorize_admin,
    async (req, res) => {
      const handle_or_id = req?.params?.handle;
      const removed = handle_or_id && await app.api.collections.remove(handle_or_id);

      res.setStatus(removed ? 200 : 404).end();
    }
  );

  // list

  polka.get(
    '/',
    async (req, res) => {
      
      const q = (/** @type {ApiQuery<CollectionType>} */ (
        parse_query(req.query))
      );
      const items = await app.api.collections.list(q);

      res.sendJson(items);
    }
  );

  polka.get(
    '/:collection/products/tags',
    async (req, res) => {
      const { collection } = req.params;
      const items = await app.api.collections.list_all_collection_products_tags(collection);
      res.sendJson(items);
    }
  ); 

  polka.get(
    '/:collection/products/count_query',
    async (req, res) => {
      const { collection } = req.params;
      const q = (/** @type {ApiQuery<ProductType | VariantType>} */ (
        parse_query(req.query))
      );
      const count = await app.api.collections.count_collection_products_query(collection, q);
      res.sendJson({ count });
    }
  ); 
  
  
  // query a specific collection's products
  polka.get(
    '/:collection/products',
    async (req, res) => {
      const { collection } = req.params;
      const q = (/** @type {ApiQuery<ProductType>} */ (
        parse_query(req.query))
      );
      const items = await app.api.collections.list_collection_products(collection, q);
      
      res.sendJson(items);
    }
  ); 

  // Export a collection into storage
  polka.post(
    '/:collection/export',
    middle_authorize_admin,
    async (req, res) => {
      const { collection } = req.params;
      const result = await app.api.collections.export_collection(collection);

      res.sendJson(result);
    }
  );

  return polka;
}

