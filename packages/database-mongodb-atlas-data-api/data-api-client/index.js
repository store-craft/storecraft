import { EJSON } from 'bson';

export class MongoDBDataAPIClient {
  /** @type {import("./types.js").Config} */ #config

  /**
   * 
   * @param {import("./types.js").Config} config 
   */
  constructor(config) {
    this.#config = config;
    this.#config.dataSource = this.#config.dataSource ?? 'mongodb-atlas';
  }

  get config() { return this.#config; }

  /**
   * get a database by name
   * @param {string} database_name database name
   */
  db(database_name) {
    return this.database(database_name);
  }

  /**
   * get a database by name
   * @param {string} database_name database name
   */
  database(database_name) {
    return {
      /**
       * get a collection handler
       * @template T
       * @param {string} collection_name collection name
       * @returns {Collection<T>}
       */
      collection: (collection_name) => {
        return new Collection(
          this, database_name, collection_name
        );
      }
    }
  }
}

/**
 * @template TSchema
 */
export class Collection {
  /** @type {MongoDBDataAPIClient} */ #client
  /** @type {string} */ #database_name
  /** @type {string} */ #collection_name
  /** @type {string} */ #endpoint

  /**
   * 
   * @param {MongoDBDataAPIClient} client 
   * @param {string} database_name 
   * @param {string} collection_name 
   */
  constructor(client, database_name, collection_name) {
    this.#client = client;
    this.#database_name = database_name;
    this.#collection_name = collection_name;
  }

  get data_source() { return this.#client.config.dataSource; }
  get database_name() { return this.#database_name; }
  get collection_name() { return this.#collection_name; }
  get client() { return this.#client; }
  get config() { return this.#client.config; }
  get endpoint() { return this.config.endpoint; }

  /**
   * Execute a API action.
   * @link https://www.mongodb.com/docs/atlas/api/data-api-resources/
   * @template T
   * @template R
   * @param {string} action action name (`findOne` / `updateMany` ...)
   * @param {T} body 
   * @returns {Promise<R>}
   */
  async #action(action, body) {

    body = {
      ...body,
      database: this.database_name,
      collection: this.collection_name,
      dataSource: this.data_source
    }

    const r = await fetch(
      `${this.endpoint}/action/${action}`,
      {
        method: 'post',
        body: EJSON.stringify(body, { relaxed: false }),
        headers: {
          'Content-Type': 'application/ejson',
          'Accept': 'application/ejson',
          'Access-Control-Request-Headers': '*',
          'apiKey': this.config.apiKey
        },
      }
    );

    const txt = await r.text();
    return EJSON.parse(txt, { relaxed: true });
  }

  /**
   * Find a Single Document.
   * @link https://www.mongodb.com/docs/atlas/api/data-api-resources/#find-a-single-document
   * @param {import("mongodb").Filter<TSchema>} filter
   * @param {import("mongodb").FindOptions['projection']} [projection] 
   * @returns {Promise<TSchema | null>}
   */
  async findOne(filter, projection) {
    /** @type {{ document: TSchema | null }} */
    const r = await this.#action(
      'findOne', {
        filter, projection
      }
    );
    return r.document;
  }

  /**
   * Find Multiple Documents.
   * @link https://www.mongodb.com/docs/atlas/api/data-api-resources/#find-multiple-documents
   * @param {import("mongodb").Filter<TSchema>} filter
   * @param {import("mongodb").Sort} [sort] 
   * @param {number} [limit=10] 
   * @param {number} [skip=0] 
   * @param {import("mongodb").FindOptions<TSchema>['projection']} [projection] 
   * @returns {{ toArray: () => Promise<TSchema[]> }}
   */
  find(filter, sort, limit=10, skip=0, projection) {
    return {
      toArray: async () => {
        /** @type {{ documents: Array<TSchema> }} */
        const r = await this.#action(
          'find', {
            filter, projection, sort, limit, skip
          }
        );
        // console.log('find ', r);

        return r.documents ?? [];
      }
    }
  }

  /**
   * insert single document.
   * Insert a Single Document.
   * @link https://www.mongodb.com/docs/atlas/api/data-api-resources/#insert-a-single-document
   * @param {TSchema} document 
   * @returns {Promise<{ insertedId: string }>}
   */
  insertOne(document) {
    return this.#action(
      'insertOne', {
        document
      }
    );
  }
  
  /**
   * Insert Multiple Documents.
   * @link https://www.mongodb.com/docs/atlas/api/data-api-resources/#insert-multiple-documents
   * @param {TSchema[]} documents
   * @returns {Promise<{ insertedIds: Array<string> }>}
   */
  insertMany(documents) {
    return this.#action(
      'insertMany', {
        documents
      }
    );
  }
    
  /**
   * Update a Single Document.
   * @link https://www.mongodb.com/docs/atlas/api/data-api-resources/#update-a-single-document
   * @param {import("mongodb").Filter<TSchema>} filter
   * @param {import("mongodb").UpdateFilter<TSchema>} update
   * @param {boolean} [upsert=false]
   * @returns {Promise<{
   *  matchedCount: number
   *  modifiedCount: number
   *  upsertedId?: string
   * }>}
   */
  updateOne(filter, update, upsert=false) {
    return this.#action(
      'updateOne', {
        filter, update, upsert
      }
    );
  }

  /**
   * Update Multiple Documents.
   * @link https://www.mongodb.com/docs/atlas/api/data-api-resources/#update-multiple-documents
   * @param {import("mongodb").Filter<TSchema>} filter
   * @param {import("mongodb").UpdateFilter<TSchema>} update
   * @param {boolean} [upsert=false]
   * @returns {Promise<{
   *  matchedCount: number
   *  modifiedCount: number
   *  upsertedId?: string
   * }>}
   */
  updateMany(filter, update, upsert=false) {
    return this.#action(
      'updateMany', {
        filter, update, upsert
      }
    );
  }

  /**
   * Delete a Single Document.
   * @link https://www.mongodb.com/docs/atlas/api/data-api-resources/#delete-a-single-document
   * @param {import("mongodb").Filter<TSchema>} filter
   * @returns {Promise<{ deletedCount: number }>}
   */
  deleteOne(filter) {
    return this.#action(
      'deleteOne', {
        filter
      }
    );
  }

  /**
   * Delete Multiple Documents.
   * @link https://www.mongodb.com/docs/atlas/api/data-api-resources/#delete-multiple-documents
   * @param {import("mongodb").Filter<TSchema>} filter
   * @returns {Promise<{ deletedCount: number }>}
   */
  deleteMany(filter) {
    return this.#action(
      'deleteMany', {
        filter
      }
    );
  }

  /**
   * Run an Aggregation Pipeline.
   * @link https://www.mongodb.com/docs/atlas/api/data-api-resources/#run-an-aggregation-pipeline
   * @param {Array<Document>} pipeline 
   * @returns {Promise<{ documents: Document[] }>}
   */
  aggregate(pipeline) {
    return this.#action(
      'aggregate', {
        pipeline
      }
    );
  }

}
