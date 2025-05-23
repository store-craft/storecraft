import type { 
  CollectionType, DiscountType, PostType, 
  ProductType, ShippingMethodType, StorefrontType, 
  TagType 
} from '@storecraft/core/api'

export { seed } from './index.js'

export type SeedData = Partial<{
  collections: CollectionType[],
  products: ProductType[],
  shipping: ShippingMethodType[],
  discounts: DiscountType[],
  posts: PostType[],
  tags: TagType[],
  storefronts: StorefrontType[],
}>