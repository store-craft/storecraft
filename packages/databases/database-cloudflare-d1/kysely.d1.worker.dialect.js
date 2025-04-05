/**
 * @import { Driver, Dialect, DatabaseConnection, QueryResult } from 'kysely';
 * @import { D1ConfigWorker as Config } from './types.public.js';
 */
import {
  CompiledQuery,
  Kysely,
  SqliteAdapter,
  SqliteIntrospector,
  SqliteQueryCompiler,
} from 'kysely';

/**
 * @description Official Storecraft Cloudflare D1 adapter on Worker
 * 
 * @implements {Dialect}
 */
export class D1_Worker_Dialect {

  /** @param {Config} config */
  constructor(config) {
    this.config = config;
  }

  createAdapter() { return new SqliteAdapter(); }
  createDriver() { return new D1Driver(this.config); }
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

  /** @param {Config} config */
  constructor(config) {
    this.config = config;
  }

  async init() {}

  async acquireConnection() {
    return new D1Connection(this.config);
  }

  /**
   * @param {D1Connection} conn 
   */
  beginTransaction(conn) { return conn.beginTransaction(); }

  /**
   * @param {D1Connection} conn 
   */
  commitTransaction(conn) {
    return conn.commitTransaction();
  }

  /**
   * @param {D1Connection} conn 
   */
  rollbackTransaction(conn){
    return conn.rollbackTransaction();
  }

  /**
   * @param {D1Connection} _conn 
   */
  async releaseConnection(_conn) {}

  async destroy() {}
}


/**
 * @implements {DatabaseConnection}
 */
class D1Connection {
  isBatch = false;
  /** @type {CompiledQuery[]} */
  batch = []

  /**
   * @param {Config} config 
   */
  constructor(config) {
    this.config = config;
  }

  /**
   * @template R result type
   * 
   * @param {CompiledQuery[]} compiledQueries 
   * 
   * @returns {Promise<QueryResult<R>>}
   */
  async _internal_execute(compiledQueries) {

    const db = this.config.db;
    // console.log(JSON.stringify(
    //   {
    //     sql: compiledQueries.at(0).sql,
    //     params: compiledQueries.at(0).parameters,
    //   }, null, 2))
    const results = await db.batch(
      compiledQueries.map(
        cq => db.prepare(cq.sql).bind(...cq.parameters)
      )
    );

    // // console.log('q', JSON.stringify({sql, params}, null, 2))
    // console.log('result', JSON.stringify(results, null, 2))
    // if (!results?.success) {
    //   const is_auth_declined_error = params?.at(0)==='_cf_KV';
    //   console.log('is_auth_declined_error', is_auth_declined_error)
    //   if(!is_auth_declined_error)
    //     throw new Error(results?.errors?.join(', '));
    // }

    const last_result = results?.at(-1);
    const meta = last_result?.meta;
    const numAffectedRows = meta?.changes > 0 ? BigInt(meta?.changes) : undefined;

    return {
      insertId:
        meta?.last_row_id === undefined || meta?.last_row_id === null
          ? undefined
          : BigInt(meta?.last_row_id),
      rows: ( /** @type {R[]} */(last_result?.results)) || [],
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
   * @returns {Promise<QueryResult<R>>}
   */
  async executeQuery(compiledQuery) {
    // console.log('this.isBatch', this.isBatch);

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
    // console.log('beginTransaction')
    // console.trace()
    this.isBatch = true;
    this.batch = [];
  }

  async commitTransaction() {
    // console.log('commitTransaction')
    // console.trace()
    this.isBatch = false;
    await this._internal_execute(this.batch);
  }

  async rollbackTransaction() {
    return;
  }

  /** @type {DatabaseConnection["streamQuery"]} */
  async *streamQuery(compiledQuery, chunkSize) {
    throw new Error('D1 Driver does not support streaming');
  }
}