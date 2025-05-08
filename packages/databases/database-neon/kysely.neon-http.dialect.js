/**
 * @import { NeonHttpConfig } from './types.public.js';
 * @import { 
 *  Dialect, Driver, DatabaseConnection, 
 *  TransactionSettings,QueryResult 
 * } from 'kysely';
 * @import { NeonQueryFunction } from '@neondatabase/serverless';
 */
import {
  CompiledQuery,
  PostgresIntrospector,
  PostgresQueryCompiler,
} from "kysely"
import { neon } from "@neondatabase/serverless"
import { NeonHttpAdapter } from "./kysely.neon-http.adapter.js";


/**
 * @implements {Dialect}
 */
export class NeonHTTPDialect {
  /** @type {NeonHttpConfig} */
  config;

  /**
   * 
   * @param {NeonHttpConfig} config 
   */
  constructor(config) {
    this.config = config
  }

  createAdapter() { return new NeonHttpAdapter() }
  createDriver() { return new NeonHTTPDriver(this.config) }
  createQueryCompiler() { return new PostgresQueryCompiler() }
  createIntrospector(db) { return new PostgresIntrospector(db) }
}


/**
 * @implements {Driver}
 */
class NeonHTTPDriver {

  /**
   * 
   * @param {NeonHttpConfig} config 
   */
  constructor(config) {
    this.config = config
    this.neon = neon(this.config.connectionString, { fullResults: true }); 
  }

  async init() {}
  async acquireConnection() { 
    return new NeonHttpConnection(this.neon, this.config);
  }

  /**
   * 
   * @param {NeonHttpConnection} connection 
   * @param {TransactionSettings} settings 
   */
  async beginTransaction(connection, settings) {
    await connection.beginTransaction();
  }

  /**
   * 
   * @param {NeonHttpConnection} connection 
   */
  async commitTransaction(connection) {
    await connection.commitTransaction();
  }

  /**
   * 
   * @param {NeonHttpConnection} connection 
   */
  async rollbackTransaction(connection) {
    await connection.rollbackTransaction();
  }

  /**
   * 
   * @param {NeonHttpConnection} _conn 
   */
  async releaseConnection(_conn) {}

  async destroy() {
  }
}


/**
 * @implements {DatabaseConnection}
 */
export class NeonHttpConnection {
  isBatch = false;
  /** @type {CompiledQuery[]} */
  batch = []

  /**
   * 
   * @param {NeonQueryFunction} client 
   * @param {NeonHttpConfig} config 
   */
  constructor(client, config) {
    this.client = client;
    this.config = config;
  }

  /**
   * 
   * @param {CompiledQuery[]} compiledQueries 
   * 
   * @returns {Promise<QueryResult<Record<string, any>>>}
   */
  async #internal_executeQuery(compiledQueries) {
    const stmts = compiledQueries.map(
      cq => this.client(
        cq.sql,
        [...cq.parameters],
      )
    );

    const results = await this.client.transaction(
      stmts, {
        arrayMode: false,
        fullResults: true
      }
    )

    // console.log('q', JSON.stringify({sql, params}, null, 2))
    // console.log('stmts', JSON.stringify(stmts, null, 2))
    // console.log('result', JSON.stringify(results, null, 2))


    const last_result = results?.at(-1);

    if (
      last_result.command === "INSERT" ||
      last_result.command === "UPDATE" ||
      last_result.command === "DELETE"
    ) {
      const numAffectedRows = BigInt(last_result?.rowCount ?? 0)

      return {
        numAffectedRows,
        rows: last_result.rows ?? [],
      }
    }

    return {
      rows: last_result.rows ?? [],
    }

  } 

  /**
   * 
   * @param {CompiledQuery} compiledQuery 
   * 
   * @returns {Promise<QueryResult>}
   */
  async executeQuery(compiledQuery) {
    // console.log('this.isBatch', this.isBatch)
    if(this.isBatch) {
      this.batch.push(compiledQuery);
      return Promise.resolve(
        {
          rows: []
        }
      )
    } else {
      return this.#internal_executeQuery([compiledQuery]);
    }
  }
    

  async beginTransaction() {
    this.isBatch = true;
    this.batch = [];
  }

  async commitTransaction() {
    // console.log('commitTransaction')
    if(this.isBatch) {
      // console.trace()
      await this.#internal_executeQuery(this.batch);
      this.isBatch = false;
      this.batch = [];
      return;
    }

  }

  async rollbackTransaction() {
    if(this.isBatch) {
      this.isBatch = false;
      this.batch = [];
      return;
    }
  }
  
  /**
   * @template R result type
   * 
   * @param {CompiledQuery} compiledQuery 
   * @param {number} chunkSize 
   * 
   * @returns {AsyncIterableIterator<QueryResult<R>>}
   */
  async *streamQuery(compiledQuery, chunkSize) {
    throw new Error("Driver does not support streaming yet");
  }

}