/**
 * @import { 
 *  ProductType, CollectionType, DiscountType, ShippingMethodType 
 * } from '../../../api/types.api.js'
 * @import { VectorStore } from '../../types.public.js'
 */

import { DiscountApplicationEnum } from '../../../api/types.api.enums.js'

/**
 * @description Given a vector of length `n`, reshape it to another `dimension`.
 * - Truncate if `n>dimension`
 * - Add zeroes if `n<dimension`
 * @param {number[]} vector A vector
 * @param {number} dimension The number of requested dimension
 */
export const truncate_or_pad_vector = (vector, dimension) => {
  const n = vector.length;
  if(n==dimension)
    return vector;

  // truncate
  if(n>dimension) {
    return vector.slice(0, dimension);
  }

  // pad with zeroes
  else [
    ...vector,
    ...(new Array(dimension-n).fill(0))
  ]
}

/**
 * 
 * @param {ProductType | CollectionType | DiscountType | ShippingMethodType} content 
 * @param {string} page_content 
 * @param {VectorStore} vector_store 
 * @param {'products' | 'collections' | 'shipping_methods' | 'discounts'} namespace 
 */
const save_with = (content, page_content, vector_store, namespace) => {
  return vector_store.upsertDocuments(
    [
      {
        id: content.handle,
        pageContent: page_content,
        namespace: namespace,
        metadata: {
          json: JSON.stringify(content),
          handle: content.handle,
          id: content.id,
        }
      }
    ]
  );
}

/**
 * Save a {@link ProductType} in a vector store {@link VectorStore}
 * 
 * @param {ProductType} c 
 * @param {VectorStore} vector_store 
 */
export const save_product = (c, vector_store) => {
  let final = '';

  {
    final = `Product Title: ${c.title}\nPrice: ${c.price}`
    if(c.isbn) 
      final += `\nISBN: ${c.isbn}`
    if(c.description) 
      final += `\nDescription: ${c.description}`
    if(c.related_products?.length)
      final += `\nRelated Products: \n${c.related_products.map(value => `- ${value.title}\n`)}`
    if(c.collections?.length)
      final += `\nBelongs to Collections: \n${c.collections.map(value => `- ${value.title}\n`)}`
    if(c.collections?.length)
      final += `\nEligible Discounts: \n${c.discounts.map(value => `- ${value.title}\n`)}`
    if(c.tags?.length)
      final += `\nTags: ${c.tags.join(', ')}`
  }

  return save_with(c, final, vector_store, 'products');
}

/**
 * Save a {@link CollectionType} in a vector store {@link VectorStore}
 * 
 * @param {CollectionType} c 
 * @param {VectorStore} vector_store 
 */
export const save_collection = (c, vector_store) => {
  let final = '';
  
  {
    final = `Collection Title: ${c.title}`
    if(c.description) 
      final += `\nDescription: ${c.description}`
    if(c.tags?.length)
      final += `\nTags: ${c.tags.join(', ')}`
  }

  return save_with(c, final, vector_store, 'collections');
}

/**
 * Save a {@link ShippingMethodType} in a vector store {@link VectorStore}
 * 
 * @param {ShippingMethodType} c 
 * @param {VectorStore} vector_store 
 */
export const save_shipping_method = (c, vector_store) => {

  let final = '';
  {
    final = `Shipping Method Title: ${c.title}\nPrice: ${c.price}`
    if(c.description) 
      final += `\nDescription: ${c.description}`
    if(c.tags?.length)
      final += `\nTags: ${c.tags.join(', ')}`
  }

  return save_with(c, final, vector_store, 'shipping_methods');
}


/**
 * Save a {@link DiscountType} in a vector store {@link VectorStore}
 * 
 * @param {DiscountType} c 
 * @param {VectorStore} vector_store 
 */
export const save_discount = (c, vector_store) => {
  const discount_application = (c.application.id===DiscountApplicationEnum.Auto.id) ? 'Automatic' : 'Coupon'
  let final = `${discount_application} Discount Title: ${c.title}`

  // final += '\nDiscount Breakdown:'
  // switch(c.info.details.meta.type) {
  //   case 'regular':
  //     final += 'Buy '
  //   case 'bulk':
  //   case 'bundle':
  //   case 'buy_x_get_y':
  //   case 'order':
  // }

  if(c.description) 
    final += `\nDescription: ${c.description}`
  if(c.tags?.length)
    final += `\nTags: ${c.tags.join(', ')}`

  return save_with(c, final, vector_store, 'discounts');
}