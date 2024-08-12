import {
  CompiledQuery,
  PostgresAdapter,
  PostgresIntrospector,
  PostgresQueryCompiler,
} from "kysely"
import { neon } from "@neondatabase/serverless"

/**
 * @typedef {object} NeonHTTPDialectConfig
 * @prop {string} connectionString
 */

/**
 * @typedef {import("@neondatabase/serverless").ClientConfig & Partial<import("@neondatabase/serverless").NeonConfig>} NeonDialectConfig
 * @typedef {import("kysely").Dialect} Dialect
 * @typedef {import("kysely").Driver} Driver
 * @typedef {import("kysely").DatabaseConnection} DatabaseConnection
 */


/**
 * @implements {Dialect}
 */
export class NeonHTTPDialect {
  /** @type {NeonHTTPDialectConfig} */
  config;

  /**
   * 
   * @param {NeonHTTPDialectConfig} config 
   */
  constructor(config) {
    this.config = config
  }

  createAdapter() { return new PostgresAdapter() }
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
   * @param {NeonHTTPDialectConfig} config 
   */
  constructor(config) {
    this.config = config
    this.neon = neon(this.config.connectionString, { fullResults: true }); 
  }

  async init() {}
  async acquireConnection() { 
    return new NeonHttpConnection(this.neon, this.config);
  }

  async beginTransaction(
    _: DatabaseConnection,
    __: TransactionSettings
  ): Promise<void> {
    throw new Error("Transactions are not supported with Neon HTTP connections")
  }

  async commitTransaction(_: DatabaseConnection): Promise<void> {
    throw new Error("Transactions are not supported with Neon HTTP connections")
  }

  async rollbackTransaction(_: DatabaseConnection): Promise<void> {
    throw new Error("Transactions are not supported with Neon HTTP connections")
  }

  async releaseConnection(_: DatabaseConnection): Promise<void> {
    // noop
  }

  async destroy() {
    // noop
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
   * @param {import("@neondatabase/serverless").NeonQueryFunction} client 
   * @param {NeonHTTPDialectConfig} config 
   */
  constructor(client, config) {
    this.client = client;
    this.config = config;
  }

  /**
   * @template R result type
   * 
   * @param {CompiledQuery[]} compiledQueries 
   * 
   * @returns {Promise<import('kysely').QueryResult<R>>}
   */
  async #internal_executeQuery(compiledQueries) {
    // Transactions are not supported yet.
    // if (this.#transactionClient) return this.#transactionClient.executeQuery(compiledQuery)

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
    console.log('stmts', JSON.stringify(stmts, null, 2))
    console.log('result', JSON.stringify(results, null, 2))


    const last_result = results?.at(-1);

    if (
      last_result.command === "INSERT" ||
      last_result.command === "UPDATE" ||
      last_result.command === "DELETE"
    ) {
      const numAffectedRows = BigInt(last_result?.rowCount ?? 0)

      return {
        // TODO: remove.
        numUpdatedOrDeletedRows: numAffectedRows,
        numAffectedRows,
        rows: last_result.rows ?? [],
      }
    }

    return {
      rows: last_result.rows ?? [],
    }

  } 

  /**
   * @template R result type
   * 
   * @param {CompiledQuery} compiledQuery 
   * 
   * @returns {Promise<import('kysely').QueryResult<R>>}
   */
  async executeQuery(compiledQuery) {
    console.log('this.isBatch', this.isBatch)
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
    console.log('commitTransaction')
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
   * @returns {AsyncIterableIterator<import('kysely').QueryResult<R>>}
   */
  async *streamQuery(compiledQuery, chunkSize) {
    throw new Error("Libsql Driver does not support streaming yet");
  }

}