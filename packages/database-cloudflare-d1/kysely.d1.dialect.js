import {
  CompiledQuery,
  Kysely,
  SqliteAdapter,
  SqliteIntrospector,
  SqliteQueryCompiler,
} from 'kysely';
import { Client } from './d1/api.js';
import { prepare_and_bind } from './kysely.d1.utils.js';


/**
 * @typedef {import('kysely').Driver} Driver
 * @typedef {import('kysely').Dialect} Dialect
 * @typedef {import('kysely').DatabaseConnection} DatabaseConnection
 * @typedef {import('./types.public.js').Config} Config
 */

/**
 * @description Official Storecraft <-> Cloudflare D1 adapter
 * 
 * @implements {Dialect}
 */
export class D1Dialect {

  /** @type {Config} */
  #config;

  /** @param {Config} config */
  constructor(config) {
    this.#config = config;
  }

  createAdapter() { return new SqliteAdapter(); }
  createDriver() { return new D1Driver(this.#config); }
  createQueryCompiler() { return new SqliteQueryCompiler(); }

  /**
   * @param {Kysely<any>} db 
   */
  createIntrospector(db){
    return new SqliteIntrospector(db);
  }
}


/**
 * @implements {Driver}
 */
class D1Driver {

  /** @type {Config} */
  #config;
  /** @type {Client} */
  #client;

  /** @param {Config} config */
  constructor(config) {
    this.#config = config;
    this.#client = new Client(
      config.account_id, config.database_id, config.api_token
    );
  }

  async init() {}

  async acquireConnection() {
    return new D1Connection(this.#config, this.#client);
  }

  /**
   * 
   * @param {D1Connection} conn 
   */
  async beginTransaction(conn) {
    
    return await conn.beginTransaction();
  }

  /**
   * 
   * @param {D1Connection} conn 
   */
  async commitTransaction(conn) {
    return await conn.commitTransaction();
  }

  /**
   * 
   * @param {D1Connection} conn 
   */
  async rollbackTransaction(conn){
    return await conn.rollbackTransaction();
  }

  /**
   * 
   * @param {D1Connection} _conn 
   */
  async releaseConnection(_conn) {}

  async destroy() {}
}


/**
 * @implements {DatabaseConnection}
 */
class D1Connection {
  /** @type {Config} */
  #config;
  /** @type {Client} */
  #client;

  isBatch = false;

  /** @type {CompiledQuery[]} */
  batch = []

  /**
   * @param {Config} config 
   * @param {Client} client 
   */
  constructor(config, client) {
    this.#config = config;
    this.#client = client;
  }

  // /**
  //  * @template R result type
  //  * 
  //  * @param {CompiledQuery} compiledQuery 
  //  * 
  //  * @returns {Promise<import('kysely').QueryResult<R>>}
  //  */
  // async executeQuery2(compiledQuery) {
  //   // Transactions are not supported yet.
  //   // if (this.#transactionClient) return this.#transactionClient.executeQuery(compiledQuery)

  //   const results = await this.#config.database
  //     .prepare(compiledQuery.sql)
  //     .bind(...compiledQuery.parameters)
  //     .all();
  //   if (results.error) {
  //     throw new Error(results.error);
  //   }

  //   const numAffectedRows = results.meta.changes > 0 ? BigInt(results.meta.changes) : undefined;

  //   return {
  //     insertId:
  //       results.meta.last_row_id === undefined || results.meta.last_row_id === null
  //         ? undefined
  //         : BigInt(results.meta.last_row_id),
  //     rows: (results?.results as O[]) || [],
  //     numAffectedRows,
  //     // @ts-ignore deprecated in kysely >= 0.23, keep for backward compatibility.
  //     numUpdatedOrDeletedRows: numAffectedRows,
  //   };
  // }

  /**
   * @template R result type
   * 
   * @param {CompiledQuery[]} compiledQueries 
   * 
   * @returns {Promise<import('kysely').QueryResult<R>>}
   */
  async _internal_execute(compiledQueries) {
    // Transactions are not supported yet.
    // if (this.#transactionClient) return this.#transactionClient.executeQuery(compiledQuery)

    /** @type {string} */
    let sql;
    /** @type {string[]} */
    let params;

    if(compiledQueries?.length > 1) {
      sql = compiledQueries.map(
        cq => prepare_and_bind(cq.sql, cq.parameters)
      ).join(';');
      params = undefined;
    } else {
      sql = compiledQueries?.at(0)?.sql;
      params = compiledQueries?.at(0)?.parameters;
    }

    const results = await this.#client.query(
      {
        sql, params
      }
    );

    // console.log('q', JSON.stringify({sql, params}, null, 2))
    console.log('result', JSON.stringify(results, null, 2))
    if (!results?.success) {
      const is_auth_declined_error = params?.at(0)==='_cf_KV';
      console.log('is_auth_declined_error', is_auth_declined_error)
      if(!is_auth_declined_error)
        throw new Error(results?.errors?.join(', '));
    }

    const first_result = results?.result?.at(0);
    const meta = first_result?.meta;
    const numAffectedRows = meta?.changes > 0 ? BigInt(meta?.changes) : undefined;

    return {
      insertId:
        meta?.last_row_id === undefined || meta?.last_row_id === null
          ? undefined
          : BigInt(meta?.last_row_id),
      rows: (first_result?.results) || [],
      numAffectedRows,
      // @ts-ignore deprecated in kysely >= 0.23, keep for backward compatibility.
      numUpdatedOrDeletedRows: numAffectedRows,
    };

  } 

  /**
   * @template R result type
   * 
   * @param {CompiledQuery} compiledQuery 
   * 
   * @returns {Promise<import('kysely').QueryResult<R>>}
   */
  async executeQuery(compiledQuery) {
    // Transactions are not supported yet.
    // if (this.#transactionClient) return this.#transactionClient.executeQuery(compiledQuery)
    console.log('this.isBatch', this.isBatch)
    if(this.isBatch) {
      this.batch.push(compiledQuery);
      return Promise.resolve(
        {
          rows: []
        }
      )
    } else {
      return this._internal_execute([compiledQuery]);
    }
  }
  
  async beginTransaction() {
    console.log('beginTransaction')
    console.trace()
    this.isBatch = true;
    this.batch = [];
  }

  async commitTransaction() {
    console.log('commitTransaction')
    console.trace()
    this.isBatch = false;
    await this._internal_execute(this.batch);
  }

  async rollbackTransaction() {
    return;
  }


  /**
   * @template R result type
   * 
   * @param {CompiledQuery} compiledQuery 
   * @param {number} chunkSize 
   * 
   * @returns {AsyncIterableIterator<import('kysely').QueryResult<R>>}
   */
  async *streamQuery(compiledQuery, chunkSize) {
    throw new Error('D1 Driver does not support streaming');
  }
}