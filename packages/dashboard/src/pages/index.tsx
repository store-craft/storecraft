
export { default as Home } from './home'
export { default as Orders } from './orders'
export { default as Order } from './order'
export { default as Customers } from './customers'
export { default as Customer } from './customer'
export { default as Tags } from './tags'
export { default as Tag } from './tag'
export { default as Templates } from './templates'
export { default as Template } from './template'
export { default as Products } from './products'
export { default as Product } from './product'
export { default as Collections } from './collections'
export { default as Collection } from './collection'
export { default as Discounts } from './discounts'
export { default as Discount } from './discount'
export { default as ShippingMethods } from './shipping-methods'
export { default as ShippingMethod } from './shipping-method'
export { default as Storefronts } from './storefronts'
export { default as Storefront } from './storefront'
export { default as Posts } from './posts'
export { default as Post } from './post'
export { default as PaymentGateways } from './payment-gateways'
export { default as PaymentGateway } from './payment-gateway'
export { default as Extensions } from './extensions'
export { default as Extension } from './extension'
export { default as Settings } from './settings'

export type BaseDocumentState<T = any> = {
  hasChanged?: boolean
  data?: T
}
export type BaseDocumentContext<State extends BaseDocumentState = any> = {
  getState?: () => State
}