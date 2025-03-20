/**
 * @import { ProductType } from '../../../api/types.public.js'
 */
import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { 
  save_product, save_collection, 
  save_discount, save_shipping_method 
} from './index.js'
import { DummyVectorStore } from './dummy-vector-store/index.js';

test(
  'test `save_product`',
  async () => {
    const vector_store = new DummyVectorStore();

    await save_product(
      {
        active: true, 
        handle: 'super-mario-nes',
        description: 'Super Mario Bros. NES',
        id: 'pr_sdisdcime9wjcwe9jwp9jw',
        title: 'Super Mario Bros. NES',
        price: 29.99,
        isbn: '978-0-07-881787-8',
        qty: 4,
        collections: [
          {
            active: true,
            handle: 'nintendo',
            id: 'col_sdisdcime9wjcwe9jwp9jw',
            title: 'Nintendo'
          }
        ],
        tags: ['nes', 'nintendo', 'mario', 'retro'],
        discounts: [
          {
            handle: '10-off',
            id: 'dis_sdisdcime9wjcwe9jwp9jw',
            title: '10% Off',
            active: false,
            priority: 0,
            info: undefined,
            application: {
              id: 0,
              name: '',
              name2: 'automatic'
            }
          }
        ],
        related_products: [
          {
            handle: 'super-mario-nes-2',
            id: 'pr_sdisdcime9wjcwe9jwp9jw',
            title: 'Super Mario Bros. 2 NES',
            active: false,
            price: 30,
            qty: 10
          }
        ]
      }, 
      vector_store
    );

    // console.log(vector_store.docs)

    // console.log(vector_store.docs[product.handle].pageContent)
    assert.equal(
      {
        id: 'super-mario-nes',
        pageContent: 'Product Title: Super Mario Bros. NES\n' +
          'Price: 29.99\n' +
          'ISBN: 978-0-07-881787-8\n' +
          'Description: Super Mario Bros. NES\n' +
          'Related Products: \n' +
          '- Super Mario Bros. 2 NES\n' +
          '\n' +
          'Belongs to Collections: \n' +
          '- Nintendo\n' +
          '\n' +
          'Eligible Discounts: \n' +
          '- 10% Off\n' +
          '\n' +
          'Tags: nes, nintendo, mario, retro',
        namespace: 'products',
        metadata: {
          json: '{"active":true,"handle":"super-mario-nes","description":"Super Mario Bros. NES","id":"pr_sdisdcime9wjcwe9jwp9jw","title":"Super Mario Bros. NES","price":29.99,"isbn":"978-0-07-881787-8","qty":4,"collections":[{"active":true,"handle":"nintendo","id":"col_sdisdcime9wjcwe9jwp9jw","title":"Nintendo"}],"tags":["nes","nintendo","mario","retro"],"discounts":[{"handle":"10-off","id":"dis_sdisdcime9wjcwe9jwp9jw","title":"10% Off","active":false,"priority":0,"application":{"id":0,"name":"","name2":"automatic"}}],"related_products":[{"handle":"super-mario-nes-2","id":"pr_sdisdcime9wjcwe9jwp9jw","title":"Super Mario Bros. 2 NES","active":false,"price":30,"qty":10}]}',
          handle: 'super-mario-nes',
          id: 'pr_sdisdcime9wjcwe9jwp9jw',
          embedder_tag_json: '{"dimension":1024,"model":"dummy-embedder-1024","provider":"DummyEmbedder"}'
        }
      },
      vector_store.docs['super-mario-nes'],
    );

  }
);


test(
  'test `save_collection`',
  async () => {
    const vector_store = new DummyVectorStore();

    await save_collection(
      {
        active: true, 
        handle: 'nintendo-games',
        description: 'This collection has all the Nintendo games',
        id: 'col_sdisdcime9wjcwe9jwp9jw',
        title: 'Nintendo Games',
        tags: ['nes', 'nintendo', 'mario', 'retro']
      }, 
      vector_store
    );

    // console.log(vector_store.docs)
    assert.equal(
      {
        id: 'nintendo-games',
        pageContent: 'Collection Title: Nintendo Games\n' +
          'Description: This collection has all the Nintendo games\n' +
          'Tags: nes, nintendo, mario, retro',
        namespace: 'collections',
        metadata: {
          json: '{"active":true,"handle":"nintendo-games","description":"This collection has all the Nintendo games","id":"col_sdisdcime9wjcwe9jwp9jw","title":"Nintendo Games","tags":["nes","nintendo","mario","retro"]}',
          handle: 'nintendo-games',
          id: 'col_sdisdcime9wjcwe9jwp9jw',
          embedder_tag_json: '{"dimension":1024,"model":"dummy-embedder-1024","provider":"DummyEmbedder"}'
        }
      },
      vector_store.docs['nintendo-games'],
    );

  }
);



test(
  'test `save_discount`',
  async () => {
    const vector_store = new DummyVectorStore();

    await save_discount(
      {
        active: true, 
        handle: '10-off',
        description: '10% Off',
        id: 'dis_sdisdcime9wjcwe9jwp9jw',
        title: '10% Off',
        tags: ['nes', 'nintendo', 'mario', 'retro'],
        priority: 0,
        application: {
          id: 0,
          name: '',
          name2: 'automatic'
        },
        info: undefined
      }, 
      vector_store
    );

    // console.log(vector_store.docs)

    // console.log(vector_store.docs[product.handle].pageContent)
    assert.equal(
      {
        id: '10-off',
        pageContent: 'Automatic Discount Title: 10% Off\n' +
          'Description: 10% Off\n' +
          'Tags: nes, nintendo, mario, retro',
        namespace: 'discounts',
        metadata: {
          json: '{"active":true,"handle":"10-off","description":"10% Off","id":"dis_sdisdcime9wjcwe9jwp9jw","title":"10% Off","tags":["nes","nintendo","mario","retro"],"priority":0,"application":{"id":0,"name":"","name2":"automatic"}}',
          handle: '10-off',
          id: 'dis_sdisdcime9wjcwe9jwp9jw',
          embedder_tag_json: '{"dimension":1024,"model":"dummy-embedder-1024","provider":"DummyEmbedder"}'
        }
      },
      vector_store.docs['10-off'],
    );

  }
);


test(
  'test `save_shipping_method`',
  async () => {
    const vector_store = new DummyVectorStore();

    await save_shipping_method(
      {
        active: true, 
        handle: 'shipping-express',
        description: 'Express Shipping',
        id: 'ship_sdisdcime9wjcwe9jwp9jw',
        title: 'Express Shipping',
        tags: ['express', 'fast', 'shipping'],
        price: 29 
      }, 
      vector_store
    );

    // console.log(vector_store.docs)

    // console.log(vector_store.docs[product.handle].pageContent)
    assert.equal(
      {
        id: 'shipping-express',
        pageContent: 'Shipping Method Title: Express Shipping\n' +
          'Price: 29\n' +
          'Description: Express Shipping\n' +
          'Tags: express, fast, shipping',
        namespace: 'shipping',
        metadata: {
          json: '{"active":true,"handle":"shipping-express","description":"Express Shipping","id":"ship_sdisdcime9wjcwe9jwp9jw","title":"Express Shipping","tags":["express","fast","shipping"],"price":29}',
          handle: 'shipping-express',
          id: 'ship_sdisdcime9wjcwe9jwp9jw',
          embedder_tag_json: '{"dimension":1024,"model":"dummy-embedder-1024","provider":"DummyEmbedder"}'
        }
      },
      vector_store.docs['shipping-express'],
    );

  }
);


test.run();