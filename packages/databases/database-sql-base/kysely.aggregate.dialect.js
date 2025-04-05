/**
 * @import { Driver, Dialect, DatabaseConnection, QueryResult } from 'kysely';
 */
import {
  CompiledQuery,
  Kysely,
} from 'kysely';

/**
 * @typedef {object} Config
 * @prop {Dialect} dialect
 */

/**
 * @typedef {(query: CompiledQuery) => void} OnQueryInterface
 */

/**
 * @description Official Storecraft Cloudflare D1 adapter on Worker
 * 
 * @implements {Dialect}
 */
export class AggregateDialect {

  /** @type {CompiledQuery[]} */
  queries = [];

  /** @param {Config} config */
  constructor(config) {
    this.config = config;
  }

  createAdapter() { return this.config.dialect.createAdapter?.(); }
  createDriver() { 
    /** @type {OnQueryInterface} */
    const onQuery = (query) => {
      this.queries.push(query);
    }
    return new AggregateDriver(
      this.config,
      onQuery
    ); 
  }
  createQueryCompiler() { return this.config.dialect.createQueryCompiler?.(); }

  /**
   * @param {Kysely<any>} db 
   */
  createIntrospector(db){
    return this.config.dialect.createIntrospector?.(db);
  }
}


/**
 * @implements {Driver}
 */
class AggregateDriver {

  /** 
   * @param {Config} config 
   * @param {OnQueryInterface} onQuery 
   */
  constructor(config, onQuery) {
    this.onQuery = onQuery;
    this.config = config;
  }

  async init() {}

  async acquireConnection() {
    return new AggregateConnection(
      this.config,
      this.onQuery
    );
  }

  /**
   * @param {AggregateConnection} conn 
   */
  beginTransaction(conn) { return conn.beginTransaction(); }

  /**
   * @param {AggregateConnection} conn 
   */
  commitTransaction(conn) {
    return conn.commitTransaction();
  }

  /**
   * @param {AggregateConnection} conn 
   */
  rollbackTransaction(conn){
    return conn.rollbackTransaction();
  }

  /**
   * @param {AggregateConnection} _conn 
   */
  async releaseConnection(_conn) {}

  async destroy() {}
}


/**
 * @implements {DatabaseConnection}
 */
class AggregateConnection {

  /**
   * @param {Config} config 
   * @param {OnQueryInterface} onQuery 
   */
  constructor(config, onQuery) {
    this.config = config;
    this.onQuery = onQuery;
  }

  /**
   * @template R result type
   * @param {CompiledQuery} compiledQuery 
   * @returns {Promise<QueryResult<R>>}
   */
  async executeQuery(compiledQuery) {
    this.onQuery(compiledQuery);
    return Promise.resolve(
      {
        rows: []
      }
    )
  }
  
  async beginTransaction() {
  }

  async commitTransaction() {
  }

  async rollbackTransaction() {
    return;
  }

  /** @type {DatabaseConnection["streamQuery"]} */
  async *streamQuery(compiledQuery, chunkSize) {
    throw new Error('D1 Driver does not support streaming');
  }
}