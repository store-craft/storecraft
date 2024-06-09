
export { default as Home } from './home.jsx'
export { default as Orders } from './orders.jsx'
export { default as Order } from './order.jsx'
export { default as Customers } from './customers.jsx'
export { default as Customer } from './customer.jsx'
export { default as Tags } from './tags.jsx'
export { default as Tag } from './tag.jsx'
export { default as Templates } from './templates.jsx'
export { default as Template } from './template.jsx'
export { default as Products } from './products.jsx'
export { default as Product } from './product.jsx'
export { default as Collections } from './collections.jsx'
export { default as Collection } from './collection.jsx'
export { default as Discounts } from './discounts.jsx'
export { default as Discount } from './discount.jsx'
export { default as ShippingMethods } from './shipping-methods.jsx'
export { default as ShippingMethod } from './shipping-method.jsx'
export { default as Storefronts } from './storefronts.jsx'
export { default as Storefront } from './storefront.jsx'
export { default as Posts } from './posts.jsx'
export { default as Post } from './post.jsx'
export { default as PaymentGateways } from './payment-gateways.jsx'
export { default as PaymentGateway } from './payment-gateway.jsx'
export { default as Extensions } from './extensions.jsx'
export { default as Extension } from './extension.jsx'
export { default as Settings } from './settings.jsx'


/**
 * @template {any} [T=any]
 * 
 * @typedef {object} BaseDocumentState
 * @prop {boolean} [hasChanged] 
 * @prop {T} [data] 
 */


/**
 * @template {BaseDocumentState} [State=any]
 * 
 * @typedef {object} BaseDocumentContext
 * @prop {() => State} [getState] Get the values of the `fields-view` tree
 */