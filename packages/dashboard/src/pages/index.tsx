
export { default as Home } from './home.js'
export { default as Orders } from './orders.js'
export { default as Order } from './order.js'
export { default as Customers } from './customers.js'
export { default as Customer } from './customer.js'
export { default as Tags } from './tags.js'
export { default as Tag } from './tag.js'
export { default as Templates } from './templates.js'
export { default as Template } from './template.js'
export { default as Products } from './products.jsx'
export { default as Product } from './product.js'
export { default as Collections } from './collections.js'
export { default as Collection } from './collection.js'
export { default as Discounts } from './discounts.jsx'
export { default as Discount } from './discount.js'
export { default as ShippingMethods } from './shipping-methods.js'
export { default as ShippingMethod } from './shipping-method.js'
export { default as Storefronts } from './storefronts.js'
export { default as Storefront } from './storefront.js'
export { default as Posts } from './posts.js'
export { default as Post } from './post.js'
export { default as PaymentGateways } from './payment-gateways.js'
export { default as PaymentGateway } from './payment-gateway.js'
export { default as Extensions } from './extensions.js'
export { default as Extension } from './extension.js'
export { default as Settings } from './settings.js'


// /**
//  * @template {any} [T=any]
//  * 
//  * @typedef {object} BaseDocumentState
//  * @prop {boolean} [hasChanged] 
//  * @prop {T} [data] 
//  */


// /**
//  * @template {BaseDocumentState} [State=any]
//  * 
//  * @typedef {object} BaseDocumentContext
//  * @prop {() => State} [getState] Get the values of the `fields-view` tree
//  */

export type BaseDocumentState<T = any> = {
  hasChanged?: boolean
  data?: T
}
export type BaseDocumentContext<State extends BaseDocumentState = any> = {
  getState?: () => State
}