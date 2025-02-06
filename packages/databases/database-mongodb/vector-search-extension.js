/**
 * @import {extension} from '@storecraft/core/extensions'
 */
import { MongoDB } from './index.js';
/**
 * 
 * @typedef {object} Config
 * @property {string} openai_key OpenAI key
 */

/**
 * @implements {extension<Config>}
 */
export class MongoVectorSearch {
  /** @param {Config} config  */
  constructor(config) {
    this.config = config
  }

  info = {
    name: 'Mongo Vector Search',
  }

  /** @type {extension["onInit"]} */
  onInit = (app) => {
    this.app = app;
    
    app.pubsub.on(
      'products/upsert',
      async (evt) => {
        const product = evt.payload.current;
        // @ts-ignore
        product.embedding = await embed_text(
          `This product's title is ${product.title}, it's price is 
          ${product.price} and has the following description 
          ${product.description}`
        );
        console.log('Update Product ' + product.handle);
      }
    )
  }

  /** @type {extension["invokeAction"]} */
  invokeAction = (handle) => {

    if (handle==='search') {
      /** @param {{query: string, limit:number}} args */
      return async (args) => {

        const db = (/** @type {MongoDB} */ (this.app.db));

        return db.collection('products').aggregate(
          [
            {
              "$vectorSearch": {
                queryVector: await embed_text(
                  args.query, this.config.openai_key
                ),
                path: "embedding",
                exact: true,
                limit: args.limit ?? 1,
                index: "vector_index",
              },
            },
            {
              "$project": {
                embedding: 0, _relations: 0, _id: 0
              }
            }
          ],
        ).toArray();

      }
    }
  }

}


/**
 * 
 * @param {string} text 
 * @param {string} openai_key
 * @returns {Promise<number[]>} 1536 vector
 */
export const embed_text = async (text = 'hello', openai_key) => {

  const r = await fetch(
    'https://api.openai.com/v1/embeddings',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openai_key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(
        {
          input: text,
          model: 'text-embedding-3-small',
          encoding_format: 'float',
          dimensions: 1536
        }
      )
    }
  );

  const json = await r.json();

  return json.data?.[0]?.embedding;
}