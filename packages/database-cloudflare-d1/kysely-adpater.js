import {
  CompiledQuery,
  Kysely,
  SqliteAdapter,
  SqliteIntrospector,
  SqliteQueryCompiler,
} from 'kysely';


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

  /** @param {Config} config */
  constructor(config) {
    this.#config = config;
  }

  async init() {}

  async acquireConnection() {
    return new D1Connection(this.#config);
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

  /**
   * @param {Config} config 
   */
  constructor(config) {
    this.#config = config;
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

    const results = await this.#config.database
      .prepare(compiledQuery.sql)
      .bind(...compiledQuery.parameters)
      .all();
    if (results.error) {
      throw new Error(results.error);
    }

    const numAffectedRows = results.meta.changes > 0 ? BigInt(results.meta.changes) : undefined;

    return {
      insertId:
        results.meta.last_row_id === undefined || results.meta.last_row_id === null
          ? undefined
          : BigInt(results.meta.last_row_id),
      rows: (results?.results as O[]) || [],
      numAffectedRows,
      // @ts-ignore deprecated in kysely >= 0.23, keep for backward compatibility.
      numUpdatedOrDeletedRows: numAffectedRows,
    };
  }

  async beginTransaction() {
    throw new Error('Transactions are not supported yet.');
  }

  async commitTransaction() {
    throw new Error('Transactions are not supported yet.');
  }

  async rollbackTransaction() {
    throw new Error('Transactions are not supported yet.');
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