import 'dotenv/config';
import { enums } from '@storecraft/core/api';
import { create_handle, create_title_gen, get_static_ids } from './api.utils.crud.js';
import { to_handle } from '@storecraft/core/api/utils.func.js';

/**
 * 
 * this file contains setups of `products` and `discounts` with `product filters`,
 * that should apply to the products. Each entry creates:
 * 1. Discount with filters
 * 2. Positive eligible products
 * 3. Negative non-eligible products
 * 
 * Then, we can later on test, that the `discounts` were applied to the `positive`
 * products but not to the `negative` products.
 * 
 * TODO: right now, only 1 filter at a time is setup, in the future will add more
 * combination
 */

/**
 * 
 * @param {string} title 
 * @param {import('@storecraft/core/api').Filter[]} filters 
 * 
 * @return {import('@storecraft/core/api').DiscountTypeUpsert}
 */
const create_regular_discount_with_filters = (title, filters) => {
  return { 
    active: true, 
    handle: to_handle(title), 
    title,
    priority: 0, 
    application: enums.DiscountApplicationEnum.Auto, 
    info: {
      details: {
        meta: enums.DiscountMetaEnum.regular,
        /** @type {import('@storecraft/core/api').RegularDiscountExtra} */
        extra: {
          fixed: 0, percent: 10
        }
      },
      filters
    }
  }
}

/**
 * 
 * @description This will return products and a discount that applies to them
 * because their `handles` are in the `discount` filter list 
 */
export const setup_for_discount_filter_product_in_handles = () => {
  const name =  enums.FilterMetaEnum.p_in_products.name;
  const positive_product_title_gen = create_title_gen('pr', 'positive', name);
  const negative_product_title_gen = create_title_gen('pr', 'negative', name);

  /** @type {import('@storecraft/core/api').ProductTypeUpsert[]} */
  const products_positive = [1, 2].map(
    ix => {
      const title = positive_product_title_gen();

      return {
        handle: to_handle(title),
        active: true,
        price: 50,
        qty: 1,
        title: title,
      }
    }
  );

  /** @type {import('@storecraft/core/api').ProductTypeUpsert[]} */
  const products_negative = [1, 2].map(
    ix => {
      const title = negative_product_title_gen();

      return {
        handle: to_handle(title),
        active: true,
        price: 50,
        qty: 1,
        title: title,
      }
    }
  );
  
  const discount = create_regular_discount_with_filters(
    'Discount ' + name, 
    [
      { // discount for a specific product handle
        meta: enums.FilterMetaEnum.p_in_products,
        /** @type {import('@storecraft/core/api').FilterValue_p_in_products} */
        value: products_positive.map(
          pr => ({
            handle: pr.handle,
            id: pr.id,
            title: pr.title
          })
        )
      }
    ]
  )

  return {
    products_positive,
    products_negative,
    discount
  }
}

/**
 * 
 * @description This will return products and a discount that applies to them
 * because their `handles` are **NOT** in the `discount` filter list 
 */
export const setup_for_discount_filter_product_NOT_in_handles = () => {
  const name =  enums.FilterMetaEnum.p_not_in_products.name;
  const positive_product_title_gen = create_title_gen('pr', 'positive', name);
  const negative_product_title_gen = create_title_gen('pr', 'negative', name);

  /** @type {import('@storecraft/core/api').ProductTypeUpsert[]} */
  const products_negative = [1, 2].map(
    ix => {
      const title = negative_product_title_gen();

      return {
        handle: to_handle(title),
        active: true,
        price: 50,
        qty: 1,
        title: title,
      }
    }
  );
  
  /** @type {import('@storecraft/core/api').ProductTypeUpsert[]} */
  const products_positive = [1, 2].map(
    ix => {
      const title = positive_product_title_gen();

      return {
        handle: to_handle(title),
        active: true,
        price: 50,
        qty: 1,
        title: title,
      }
    }
  );

  const discount = create_regular_discount_with_filters(
    'Discount ' + name, 
    [
      { // discount for a specific product handle
        meta: enums.FilterMetaEnum.p_not_in_products,
        /** @type {import('@storecraft/core/api').FilterValue_p_not_in_products} */
        value: products_negative.map(
          pr => ({
            handle: pr.handle,
            id: pr.id,
            title: pr.title
          })
        )
      }
    ]
  )

  return {
    products_positive,
    products_negative,
    discount
  }
}


/**
 * 
 * @description This will return products and a discount that applies to them
 * because their `tags` are in the `discount` filter list 
 */
export const setup_for_discount_filter_product_in_tags = () => {
  const name =  enums.FilterMetaEnum.p_in_tags.name;
  const tags = ['a', 'b', 'c'];
  const positive_product_title_gen = create_title_gen('pr', 'positive', name);
  const negative_product_title_gen = create_title_gen('pr', 'negative', name);

  /** @type {import('@storecraft/core/api').ProductTypeUpsert[]} */
  const products_negative = [1, 2].map(
    ix => {
      const title = negative_product_title_gen();

      return {
        handle: to_handle(title),
        active: true,
        price: 50,
        qty: 1,
        title: title,
        tags: ['other']
      }
    }
  );
  
  /** @type {import('@storecraft/core/api').ProductTypeUpsert[]} */
  const products_positive = [1, 2].map(
    ix => {
      const title = positive_product_title_gen();

      return {
        handle: to_handle(title),
        active: true,
        price: 50,
        qty: 1,
        title: title,
        tags
      }
    }
  );
  
  const discount = create_regular_discount_with_filters(
    'Discount ' + name, 
    [
      { // discount for a specific product handle
        meta: enums.FilterMetaEnum.p_in_tags,
        /** @type {import('@storecraft/core/api').FilterValue_p_in_tags} */
        value: tags
      }
    ]
  )

  return {
    products_positive,
    products_negative,
    discount
  }
}

/**
 * 
 * @description This will return products and a discount that applies to them
 * because their `tags` are NOT in the `discount` filter list 
 */
export const setup_for_discount_filter_product_NOT_in_tags = () => {
  const name =  enums.FilterMetaEnum.p_not_in_tags.name;
  const tags = ['a', 'b', 'c'];
  const positive_product_title_gen = create_title_gen('pr', 'positive', name);
  const negative_product_title_gen = create_title_gen('pr', 'negative', name);

  /** @type {import('@storecraft/core/api').ProductTypeUpsert[]} */
  const products_negative = [1, 2].map(
    ix => {
      const title = negative_product_title_gen();

      return {
        handle: to_handle(title),
        active: true,
        price: 50,
        qty: 1,
        title: title,
        tags
      }
    }
  );
  
  /** @type {import('@storecraft/core/api').ProductTypeUpsert[]} */
  const products_positive = [1, 2].map(
    ix => {
      const title = positive_product_title_gen();

      return {
        handle: to_handle(title),
        active: true,
        price: 50,
        qty: 1,
        title: title,
        tags: []
      }
    }
  );
  
  const discount = create_regular_discount_with_filters(
    'Discount ' + name, 
    [
      { // discount for a specific product handle
        meta: enums.FilterMetaEnum.p_not_in_tags,
        /** @type {import('@storecraft/core/api').FilterValue_p_not_in_tags} */
        value: tags
      }
    ]
  )

  return {
    products_positive,
    products_negative,
    discount
  }
}


/**
 * 
 * @description This will return products and a discount that applies to them
 * because their `collections` are in the `discount` filter list 
 */
export const setup_for_discount_filter_product_in_collections = () => {
  const name =  enums.FilterMetaEnum.p_in_collections.name;
  const handle_col = create_handle('col', name);
  const ids_col = get_static_ids('col');

  /** @type {import('@storecraft/core/api').CollectionTypeUpsert[]} */
  const collections = [1, 2].map(
    ix => (
      {
        handle: handle_col(),
        id: ids_col[ix],
        active: true,
        price: 50,
        title: name + ' Collection ' + ix,
      }
    )
  );
  
  const positive_product_title_gen = create_title_gen('pr', 'positive', name);
  const negative_product_title_gen = create_title_gen('pr', 'negative', name);

  /** @type {import('@storecraft/core/api').ProductTypeUpsert[]} */
  const products_negative = [1, 2].map(
    ix => {
      const title = negative_product_title_gen();

      return {
        handle: to_handle(title),
        active: true,
        price: 50,
        qty: 1,
        title: title,
      }
    }
  );
  
  /** @type {import('@storecraft/core/api').ProductTypeUpsert[]} */
  const products_positive = [1, 2].map(
    ix => {
      const title = positive_product_title_gen();

      return {
        handle: to_handle(title),
        active: true,
        price: 50,
        qty: 1,
        title: title,
        collections: collections.map(c => ({handle: c.handle, id: c.id}))
      }
    }
  );

  
  const discount = create_regular_discount_with_filters(
    'Discount ' + name, 
    [
      { // discount for a specific product handle
        meta: enums.FilterMetaEnum.p_in_collections,
        /** @type {import('@storecraft/core/api').FilterValue_p_in_collections} */
        value: collections
      }
    ]
  )

  return {
    collections, 
    products_positive,
    products_negative,
    discount
  }
}


/**
 * 
 * @description This will return products and a discount that applies to them
 * because their `collections` are NOT in the `discount` filter list 
 */
export const setup_for_discount_filter_product_NOT_in_collections = () => {
  const name =  enums.FilterMetaEnum.p_not_in_collections.name;
  const handle_col = create_handle('col', name);
  const ids_col = get_static_ids('col');

  /** @type {import('@storecraft/core/api').CollectionTypeUpsert[]} */
  const collections = [1, 2].map(
    ix => (
      {
        handle: handle_col(),
        id: ids_col[ix],
        active: true,
        price: 50,
        title: name + ' Collection ' + ix,
      }
    )
  );
  
  
  const positive_product_title_gen = create_title_gen('pr', 'positive', name);
  const negative_product_title_gen = create_title_gen('pr', 'negative', name);

  /** @type {import('@storecraft/core/api').ProductTypeUpsert[]} */
  const products_negative = [1, 2].map(
    ix => {
      const title = negative_product_title_gen();

      return {
        handle: to_handle(title),
        active: true,
        price: 50,
        qty: 1,
        title: title,
        collections: collections.map(c => ({handle: c.handle, id: c.id}))
      }
    }
  );
  
  /** @type {import('@storecraft/core/api').ProductTypeUpsert[]} */
  const products_positive = [1, 2].map(
    ix => {
      const title = positive_product_title_gen();

      return {
        handle: to_handle(title),
        active: true,
        price: 50,
        qty: 1,
        title: title,
      }
    }
  );

  
  const discount = create_regular_discount_with_filters(
    'Discount ' + name, 
    [
      { // discount for a specific product handle
        meta: enums.FilterMetaEnum.p_not_in_collections,
        /** @type {import('@storecraft/core/api').FilterValue_p_not_in_collections} */
        value: collections
      }
    ]
  )

  return {
    collections, 
    products_positive,
    products_negative,
    discount
  }
}


/**
 * 
 * @description This will return products and a discount that applies to them
 * because the filter list applies to all
 */
export const setup_for_discount_filter_product_all = () => {
  const name =  enums.FilterMetaEnum.p_all.name;
  const handle_pr = create_handle('pr', name);
  
  /** @type {import('@storecraft/core/api').ProductTypeUpsert[]} */
  const products = [1, 2].map(
    ix => (
      {
        handle: handle_pr(),
        active: true,
        price: 50,
        qty: 1,
        title: name + ' Product ' + ix,
      }
    )
  );
  
  const discount = create_regular_discount_with_filters(
    'Discount ' + name, 
    [
      { // discount for a specific product handle
        meta: enums.FilterMetaEnum.p_all,
        /** @type {import('@storecraft/core/api').FilterValue_p_all} */
        value: undefined
      }
    ]
  )

  return {
    products,
    discount
  }
}

