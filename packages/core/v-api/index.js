// import { inter as discounts } from './con.discounts.logic.js';
import { inter as discounts } from './con.discounts.logic.js';
import { inter as collections } from './con.collections.logic.js';
import { inter as customers } from './con.customers.logic.js';
import { inter as images } from './con.images.logic.js';
import { inter as notifications } from './con.notifications.logic.js';
import { inter as orders } from './con.orders.logic.js';
import { inter as posts } from './con.posts.logic.js';
import { inter as products } from './con.products.logic.js';
import { inter as shipping } from './con.shipping.logic.js';
import { inter as storefronts } from './con.storefronts.logic.js';
import { inter as tags } from './con.tags.logic.js';
import { inter as auth } from './con.auth.logic.js';
import { inter as checkout } from './con.checkout.logic.js';
import { inter as templates } from './con.templates.logic.js';
import * as pricing from './con.pricing.logic.js';
import { inter as statistics } from './con.statistics.logic.js';
export * as func from './utils.func.js'
export * as index from './utils.index.js'
export * as query from './utils.query.js'
import * as enums from './types.api.enums.js'
export * as enums from './types.api.enums.js'
import { App } from '../index.js';


/**
 * @template {any} [A=any]
 * @template {any} [B=any]
 * @template {any} [C=any]
 * @template {import('../index.js').db_driver} [D=any]
 * @template {import('../index.js').storage_driver} [E=any]
 * @template {Record<string, import('../index.js').payment_gateway>} [F=any]
 * @template {Record<string, import('../index.js').extension>} [G=any]
 * 
 * @param {App<A, B, C, D, E, F, G>} app
 */
export const create_api = app => {
  
  return {
    discounts: discounts(app),
    collections: collections(app),
    customers: customers(app),
    images: images(app),
    notifications: notifications(app),
    orders: orders(app),
    posts: posts(app),
    products: products(app),
    shipping: shipping(app),
    storefronts: storefronts(app),
    tags: tags(app),
    auth: auth(app),
    checkout: checkout(app),
    statistics: statistics(app),
    templates: templates(app),
    pricing,
    enums
  }
}